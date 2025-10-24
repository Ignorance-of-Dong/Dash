<!--
 * @Author: zhangzheng
 * @Date: 2025-10-21 17:19:04
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-23 18:17:25
 * @Description: 
-->
<template>
  <DashContainer>
    <template #header>
      <DashEditorHeader />
    </template>

    <template #content>
      <div class="sandbox-canvas-container" ref="sandboxCanvasContainerRef">
        <div class="sandbox-canvas-preview-area">
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
    </template>
  </DashContainer>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
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
const sandboxCanvasContainerRef = ref<HTMLElement | null>(null);

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
  // 设置组件位置和属性
  component.style.top = e.clientY - rectInfo.y;
  component.style.left = e.clientX - rectInfo.x;

  const isPass = correctionComponentPosition(
    component,
    rectInfo,
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
const getPreviewAreaItemStyle = (style: any) => {
  const height =
    style.height == "auto"
      ? `calc(100% - ${style.top * 2}px)`
      : `${style.height}px`;

  let resultStyle: any = {
    width: "",
    height: height,
  };
  if (style.width == "auto") {
    resultStyle.width = "100%";
  } else if (style.width == "calc") {
    resultStyle.width = `calc(100% - 600px)`;
  } else {
    resultStyle.width = `${style.width}px`;
  }

  if (style.top || style.top == 0) resultStyle.top = `${style.top}px`;
  if (style.aligin == "center") {
    resultStyle.left = `50%`;
    resultStyle.transform = `translateX(-50%)`;
  } else {
    if (style.left || style.left == 0) resultStyle.left = `${style.left}px`;
  }
  if (style.right || style.right == 0) resultStyle.right = `${style.right}px`;
  if (style.bottom || style.bottom == 0)
    resultStyle.bottom = `${style.bottom}px`;

  if (style.borderRadius) {
    resultStyle.borderRadius = `${style.borderRadius}px`;
  }
  return resultStyle;
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
  }
}
</style>
