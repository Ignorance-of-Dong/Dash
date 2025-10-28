<!--
 * @Author: zhangzheng
 * @Date: 2025-10-21 17:19:04
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-28 17:26:33
 * @Description: 
-->
<template>
  <DashContainer>
    <template #header>
      <DashEditorHeader @preview="togglePreviewMode" />
    </template>

    <template #content>
      <div class="sandbox-canvas-container" ref="sandboxCanvasContainerRef">
        <div
          class="sandbox-canvas-preview-area"
          :key="editorDataStore.sandboxCanvasStyle.scale"
        >
          <div
            class="sandbox-canvas-preview-area-item"
            v-for="item in editorDataStore.sandboxCanvas"
            :key="item.id"
            :ref="
              (domRef) =>
                (getSandboxCanvasPreviewAreaItemRefObj[item.id] = domRef)
            "
            @drop="handleComponentDrop"
            :id="item.id"
            :canvasId="item.id"
            @dragover="handleComponentDragOver"
            :style="getPreviewAreaItemStyle(item)"
          >
            <div
              class="dragtips-area-container"
              :style="getDragTipsAreaStyle(item)"
              :canvasId="item.id"
              v-if="showDragTipsArea(item)"
            >
              {{ item.id }}
            </div>
            <EditorCanvasCore
              class="canvas-core editor-main"
              ref="canvasCoreRef"
              :canvas-id="item.id"
              :componentData="item.components"
              :canvas-style-data="item"
            />
          </div>
        </div>
      </div>
    </template>
  </DashContainer>
  <SandboxPreviewPanel v-if="isPreviewMode" />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, nextTick } from "vue";
import DashContainer from "./layout/DashContainer.vue";
import DashEditorHeader from "./DashEditorHeader.vue";
import { EditorState } from "./types";
import { useEditorDataStore } from "./store/editorData";
import { storeToRefs } from "pinia";
import EditorCanvasCore from "./core/EditorCanvasCore.vue";
import { changeComponentSizeWithScale } from "./utils/changeComponentsSizeWithScale";
import { v4 as uuidv4 } from "uuid";
import { componentList } from "./cursorComponent/config";
import { clone } from "ramda";
import SandboxPreviewPanel from "./preview/SandboxPreviewPanel.vue";
import {
  correctionComponentPosition,
  getRemainingArae,
} from "./utils/correction";

// 从主数据 Store 解构响应式数据
const editorDataStore = useEditorDataStore();
const { componentData, canvasStyleData, editMode, editorMap, isSpaceDown } =
  storeToRefs(editorDataStore);

const sandboxEditorState = reactive<EditorState>({
  canvasId: "sandbox-canvas-main",
});
const sandboxCanvasContainerRef = ref<any>(null);

const handleComponentDrop = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("[ e ] >", e.currentTarget);

  console.log(e.toElement);
  const canvasId = e?.currentTarget?.getAttribute("canvasId");
  const componentInfo = e.dataTransfer?.getData("id");
  if (!componentInfo) {
    console.warn("未获取到组件信息");
    return;
  }
  console.log("[ canvasId ] >", canvasId);
  console.log("[ editorMap ] >", editorMap.value);
  const canvasElement = editorMap.value[canvasId.replace("editor-", "")];
  console.log("[ canvasElement ] >", canvasElement);
  if (!canvasElement) {
    console.error("未找到画布元素");
    return;
  }
  const rectInfo = canvasElement.getBoundingClientRect();

  const componentItem: any = componentList.find(
    (item) => item.component == componentInfo
  );
  const component = clone(componentItem);
  if (!component) {
    console.error("未找到对应的组件配置");
    return;
  }

  // 获取缩放比例，反推真实位置和尺寸
  const canvasStyleScale = editorDataStore.sandboxCanvasStyle.scale || 1;

  // 设置组件位置和属性（通过缩放比例反推真实位置）
  component.style.top = (e.clientY - rectInfo.y) / canvasStyleScale;
  component.style.left = (e.clientX - rectInfo.x) / canvasStyleScale;

  // 反推真实画布尺寸用于边界判断
  const realRectInfo = {
    ...rectInfo,
    width: rectInfo.width / canvasStyleScale,
    height: rectInfo.height / canvasStyleScale,
  };

  const isPass = correctionComponentPosition(
    component,
    realRectInfo,
    editorDataStore.sandboxCanvas[canvasId.replace("editor-", "")]
  );
  if (!isPass) {
    return;
  }
  component.id = uuidv4();
  // 添加组件到画布
  editorDataStore.addSandboxComponent({
    component,
    canvasId: canvasId.replace("editor-", ""),
  });

  console.log(
    "[ editorDataStore.sandboxCanvas ] >",
    editorDataStore.sandboxCanvas
  );
};

const handleComponentDragOver = (e: DragEvent): void => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
};
const sandboxCanvasPreviewAreaItemRef = ref<HTMLElement | null>(null);
const getSandboxCanvasPreviewAreaItemRefObj = ref({});

// 计算全局容器缩放比例（基于 sandboxCanvasStyle 的高度）
const calculateContainerScale = () => {
  if (!sandboxCanvasContainerRef.value) return;

  const currentHeight = sandboxCanvasContainerRef.value.offsetHeight;

  // 使用 sandboxCanvasStyle 中的高度作为标准
  const standardHeight = editorDataStore.sandboxCanvasStyle.height;

  // 计算缩放比例：以 sandboxCanvasStyle 高度为基准
  if (standardHeight > 0) {
    if (currentHeight === standardHeight) {
      // 如果高度相等，保持缩放不变
      editorDataStore.setContainerScale(1);
    } else {
      // 否则计算新的缩放比例
      editorDataStore.setContainerScale(currentHeight / standardHeight);
    }

    console.log(
      `容器缩放比例更新: ${editorDataStore.scale} (${currentHeight}/${standardHeight})`
    );
  }
};

const getPreviewAreaItemStyle = (style: any) => {
  // 获取容器尺寸
  const containerWidth = sandboxCanvasContainerRef.value?.offsetWidth || 0;
  const containerHeight = sandboxCanvasContainerRef.value?.offsetHeight || 0;

  // 获取 sandboxCanvasStyle 中的缩放比例
  const canvasStyleScale = editorDataStore.sandboxCanvasStyle.scale || 1;

  // 计算真实逻辑坐标（用于存储和碰撞检测）
  let realLogicLeft = style.left; // 默认使用原始值（真实坐标）

  // 计算浏览器定位坐标（用于 DOM 渲染，缩放后的坐标）
  let browserPositionLeft = style.left; // 默认使用原始值

  if (style.floatPosition == "left") {
    browserPositionLeft = 0;
    realLogicLeft = 0; // 真实逻辑坐标也是 0
  } else if (style.floatPosition == "right") {
    // 浏览器定位：容器宽度 - 缩放后的画布宽度
    browserPositionLeft = containerWidth - style.width * canvasStyleScale;
    // 真实逻辑坐标：反推为真实坐标（用于碰撞检测）
    realLogicLeft = browserPositionLeft / canvasStyleScale;
  } else if (style.isPositionLeftScale) {
    // isPositionLeftScale 表示 left 需要缩放显示
    // 浏览器定位：原始值 * 缩放比例
    browserPositionLeft = style.left * canvasStyleScale;
    // 真实逻辑坐标：保持原始值（不缩放）
    realLogicLeft = style.left;
  } else {
    // 普通情况：浏览器定位和逻辑坐标都使用原始值
    browserPositionLeft = style.left;
    realLogicLeft = style.left;
  }

  // 根据 heightType 来计算高度，返回具体数值
  let heightValue: number;
  if (style.heightType === "auto") {
    // "auto" 表示和父级保持一样的高度
    heightValue = containerHeight;
  } else {
    heightValue = style.height;
  }

  // 只对宽度和高度应用缩放（定位信息已适配浏览器，无需缩放）
  const scaledHeight =
    style.heightType != "auto" ? heightValue * canvasStyleScale : style.height;
  const scaledWidth = style.width * canvasStyleScale;

  let resultStyle: any = {
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
  };

  // 定位信息
  if (style.top || style.top == 0) resultStyle.top = `${style.top}px`;
  if (style.aligin == "center") {
    resultStyle.left = `50%`;
    resultStyle.transform = `translateX(-50%)`;
  } else {
    // 使用计算好的浏览器定位坐标（已经处理了 floatPosition 和 isPositionLeftScale）
    if (browserPositionLeft !== undefined) {
      resultStyle.left = `${browserPositionLeft}px`;
    }
  }
  if (style.right || style.right == 0) resultStyle.right = `${style.right}px`;
  if (style.bottom || style.bottom == 0)
    resultStyle.bottom = `${style.bottom}px`;

  if (style.borderRadius) {
    resultStyle.borderRadius = `${style.borderRadius}px`;
  }

  // 同步画布数据到 sandboxCanvas，确保都是数字格式
  if (editorDataStore.sandboxCanvas[style.id]) {
    const canvas = editorDataStore.sandboxCanvas[style.id];

    // 更新数字格式的尺寸和位置数据
    if (typeof style.width === "number") {
      canvas.width = style.width;
    }

    canvas.height = heightValue; // height 总是具体数值

    if (typeof style.top === "number") {
      canvas.top = style.top;
    }

    // ✅ 关键修复：存储真实逻辑坐标，而不是浏览器定位坐标
    if (typeof realLogicLeft === "number") {
      canvas.left = realLogicLeft;
    }
  }

  return resultStyle;
};

// 获取全局容器缩放比例，供组件使用
const getContainerScale = (): number => {
  return editorDataStore.scale;
};

const getDragTipsAreaStyle = (style: any) => {
  // const araeContainer = getSandboxCanvasPreviewAreaItemRefObj.value[item.id];
  // return getRemainingArae(item, araeContainer);
  const resultStyle: any = {};
  if (style.borderRadius) {
    resultStyle.borderRadius = `${style.borderRadius}px`;
  }
  return resultStyle;
};

const showDragTipsArea = (item: any) => {
  if (editorDataStore.dragCanvasId) {
    return (
      editorDataStore.dragStatus == "dragIn" &&
      item.id == editorDataStore.dragCanvasId
    );
  } else {
    return editorDataStore.dragStatus == "dragIn";
  }
};

const isPreviewMode = ref(false);
const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value;
};
// 窗口大小变化处理函数
const handleWindowResize = () => {
  // 使用 nextTick 确保 DOM 更新完成后再计算
  nextTick(() => {
    calculateContainerScale();
  });
};

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      isPreviewMode.value = false;
    }
  });

  // 初始化容器缩放比例
  nextTick(() => {
    calculateContainerScale();
  });

  // 监听浏览器窗口大小变化
  window.addEventListener("resize", handleWindowResize);
  console.log("开始监听浏览器窗口大小变化");
});

onUnmounted(() => {
  // 清理窗口大小变化监听器
  window.removeEventListener("resize", handleWindowResize);
  console.log("停止监听浏览器窗口大小变化");
});

// 暴露方法供其他组件使用
defineExpose({
  getContainerScale, // 暴露全局容器缩放比例
  calculateContainerScale, // 暴露重新计算方法
});
</script>
<style lang="scss" scoped>
.sandbox-canvas-container {
  width: 100%;
  height: 100%;
  .canvas-core {
    width: 100%;
    height: 100%;
    &.editor-main {
      position: relative;
    }
  }
}
.dragtips-area-container {
  background-color: rgba(147, 189, 247, 0.348);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid #ffffff80;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

.sandbox-canvas-preview-area {
  width: 100%;
  height: calc(100% - 64px);
  position: absolute;
  .sandbox-canvas-preview-area-item {
    position: absolute;
    border-radius: 10px;
    background-color: #edb98b;
  }
}
</style>
