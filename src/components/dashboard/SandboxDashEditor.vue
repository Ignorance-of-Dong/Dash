<!--
 * @Author: zhangzheng
 * @Date: 2025-10-21 17:19:04
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-11-06 15:05:23
 * @Description: 
-->
<template>
  <DashContainer>
    <template #header>
      <DashEditorHeader @preview="togglePreviewMode" />
    </template>
    <div class="sandbox-canvas-container" ref="sandboxCanvasContainerRef">
      <div class="sandbox-canvas-preview-area" :key="scaleKey">
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
          ></div>
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
    <SandboxPreviewPanel v-if="isPreviewMode" v-memo="[isPreviewMode]" />
  </DashContainer>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, nextTick } from "vue";
import DashContainer from "./layout/DashContainer.vue";
import DashEditorHeader from "./DashEditorHeader.vue";
import { EditorState } from "./types";
import { useEditorDataStore } from "./store/editorData";
import { storeToRefs } from "pinia";
import EditorCanvasCore from "./components/EditorCanvasCore.vue";
import { changeComponentSizeWithScale } from "./utils/componentScaleAdapter";
import { v4 as uuidv4 } from "uuid";
import { componentList } from "./cursorComponent/config";
import { clone } from "ramda";
import SandboxPreviewPanel from "./preview/SandboxPreviewPanel.vue";
import {
  correctionComponentPosition,
  getRemainingArae,
} from "./utils/canvasLayoutManager";
import { computed } from "vue";

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

editorDataStore.setSandboxCanvasStatus("idle");

const scaleKey = ref(0);
// 计算全局容器缩放比例（基于 sandboxCanvasStyle 的高度）
const calculateContainerScale = () => {
  if (!sandboxCanvasContainerRef.value) return;
  scaleKey.value++;

  const containerHeight = sandboxCanvasContainerRef.value.offsetHeight;
  const containerWidth = sandboxCanvasContainerRef.value?.offsetWidth || 0;

  const standardHeight = editorDataStore.sandboxCanvasStyle.height;
  const standardWidth = editorDataStore.sandboxCanvasStyle.width;

  if (containerHeight === standardHeight) {
    editorDataStore.setContainerHeightScale(1);
  } else {
    editorDataStore.setContainerHeightScale(containerHeight / standardHeight);
    editorDataStore.setContainerWidthScale(containerWidth / standardWidth);
  }
  if (isUseWidthScale.value) {
    editorDataStore.setContainerScale(
      editorDataStore.sandboxCanvasStyle.widthScale
    );
  } else {
    editorDataStore.setContainerScale(
      editorDataStore.sandboxCanvasStyle.heightScale
    );
  }
};

const isUseWidthScale = computed(() => {
  if (!sandboxCanvasContainerRef.value) return false;
  const containerWidth = sandboxCanvasContainerRef.value?.offsetWidth || 0;
  const canvasAllWidth = Object.values(editorDataStore.sandboxCanvas).reduce(
    (acc, item) => {
      return acc + item.width;
    },
    0
  );
  return (
    canvasAllWidth * editorDataStore.sandboxCanvasStyle.heightScale >
    containerWidth
  );
});

const getPreviewAreaItemStyle = (style: any) => {
  // 获取容器尺寸
  const containerWidth = sandboxCanvasContainerRef.value?.offsetWidth || 0;
  const containerHeight = sandboxCanvasContainerRef.value?.offsetHeight || 0;
  if (!sandboxCanvasContainerRef.value) return;
  // 获取 sandboxCanvasStyle 中的缩放比例
  const canvasStyleScale = editorDataStore.sandboxCanvasStyle.scale || 1;

  const width = clone(style.width);
  let height = clone(style.height);
  let left = clone(style.left);
  let top = clone(style.top);

  const relHeight =
    containerHeight < editorDataStore.sandboxCanvasStyle.height - 64
      ? containerHeight
      : editorDataStore.sandboxCanvasStyle.height - 64;

  if (style.heightType === "auto") {
    if (isUseWidthScale.value) {
      height = relHeight;
    } else {
      height = style.height * editorDataStore.sandboxCanvasStyle.heightScale;
    }
  }

  if (style.floatPosition == "left") {
    left = 0;
  }
  if (
    style.floatPosition == "right" &&
    editorDataStore.sandboxCanvasStatus == "update"
  ) {
    left = style.left;
  }

  if (
    style.floatPosition == "right" &&
    editorDataStore.sandboxCanvasStatus == "idle"
  ) {
    left = containerWidth - width * canvasStyleScale;
    style.left = containerWidth - width * canvasStyleScale;
  }

  if (style.floatPosition == "leftTop" && style.isPositionLeftScale) {
    left = style.left * canvasStyleScale;
  }

  if (isUseWidthScale.value) {
    top = (containerHeight - relHeight) / 2;
  }
  const resultStyle: any = {
    width: width * canvasStyleScale + "px",
    height: height + "px",
    left: left + "px",
    top: top + "px",
    borderRadius: style.borderRadius * canvasStyleScale + "px",
  };

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
    editorDataStore.setSandboxCanvasStatus("idle");
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
  overflow: hidden;
  .sandbox-canvas-preview-area-item {
    position: absolute;
    border-radius: 10px;
    background: #e9e3e3;
  }
}
</style>
