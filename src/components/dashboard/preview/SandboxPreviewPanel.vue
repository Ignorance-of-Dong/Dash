<!--
 * @Author: zhangzheng
 * @Date: 2025-10-28 10:43:51
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-11-05 18:22:13
 * @Description: 
-->
<template>
  <div
    class="sandbox-preview-panel"
    ref="sandboxPreviewPanelRef"
    :key="refreshTrigger"
  >
    <div
      class="sandbox-canvas-preview-area-item"
      v-for="item in editorDataStore.sandboxCanvas"
      :key="item.id"
      :id="item.id"
      :canvasId="item.id"
      v-memo="[refreshTrigger]"
      :style="getPreviewAreaItemStyle(item)"
    >
      <div
        class="component-wrapper"
        v-for="componentItem in item.components"
        :key="item.id"
        :style="getShapeItemStyleForComponent(componentItem)"
      >
        <component
          :is="componentItem.component"
          :class="componentItem.component"
          class="component"
          :style="getComponentStyle(componentItem.style)"
          :prop-value="componentItem.propValue"
          :type="componentItem.type"
          :element="componentItem"
          :id="componentItem.id"
          :key="componentItem.key"
          :disabled="true"
          :componentId="componentItem.componentId"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, reactive, computed } from "vue";
import { useEditorDataStore } from "../store/editorData";
import { clone } from "ramda";
import { useThrottleFn } from "@vueuse/core";

const editorDataStore = useEditorDataStore();
const sandboxPreviewPanelRef = ref<any>();

// 强制重新计算的触发器
const refreshTrigger = ref(0);

const scaleStatus = reactive({
  scale: 1,
  widthScale: 1,
  heightScale: 1,
});

const getPreviewAreaItemStyle = (style: any) => {
  // 获取预览容器尺寸
  const containerWidth =
    sandboxPreviewPanelRef.value?.offsetWidth || window.innerWidth;

  const containerHeight =
    sandboxPreviewPanelRef.value?.offsetHeight || window.innerHeight;
  const width = clone(style.width);
  let height = clone(style.height);
  let left = clone(style.left);
  let top = clone(style.top);

  const relHeight =
    containerHeight < editorDataStore.sandboxCanvasStyle.height
      ? containerHeight
      : editorDataStore.sandboxCanvasStyle.height;

  if (style.heightType === "auto") {
    if (isUseWidthScale.value) {
      height = relHeight;
    } else {
      height = containerHeight;
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
    left = containerWidth - width * scaleStatus.scale;
    style.left = containerWidth - width * scaleStatus.scale;
  }

  if (style.floatPosition == "leftTop" && style.isPositionLeftScale) {
    left = style.left * scaleStatus.scale;
  }

  if (isUseWidthScale.value) {
    top = (containerHeight - relHeight) / 2;
  }
  const resultStyle: any = {
    width: width * scaleStatus.scale + "px",
    height: height + "px",
    left: left + "px",
    top: top + "px",
    borderRadius: style.borderRadius * scaleStatus.scale + "px",
  };

  return resultStyle;
};
// const isUseWidthScale = false;
const isUseWidthScale = computed(() => {
  if (!sandboxPreviewPanelRef.value) return false;
  const containerWidth = sandboxPreviewPanelRef.value?.offsetWidth || 0;
  const canvasAllWidth = Object.values(editorDataStore.sandboxCanvas).reduce(
    (acc, item) => {
      return acc + item.width;
    },
    0
  );
  return canvasAllWidth * scaleStatus.heightScale > containerWidth;
});

const getShapeItemStyleForComponent = (componentItem: any) => {
  return {
    position: "absolute" as const,
    width: componentItem.style.width * scaleStatus.scale + "px",
    height: componentItem.style.height * scaleStatus.scale + "px",
    left: componentItem.style.left * scaleStatus.scale + "px",
    top: componentItem.style.top * scaleStatus.scale + "px",
  };
};

const getComponentStyle = (style: any) => {
  return {};
};

// 触发重新计算
const triggerRecalculation = useThrottleFn(() => {
  if (!sandboxPreviewPanelRef.value) return;

  console.log("[ 1 ] >", 1);
  refreshTrigger.value++;

  const containerHeight = sandboxPreviewPanelRef.value.offsetHeight;
  const containerWidth = sandboxPreviewPanelRef.value?.offsetWidth || 0;

  const standardHeight = editorDataStore.sandboxCanvasStyle.height;
  const standardWidth = editorDataStore.sandboxCanvasStyle.width;

  if (containerHeight === standardHeight) {
    scaleStatus.heightScale = 1;
  } else {
    scaleStatus.heightScale = containerHeight / standardHeight;
    scaleStatus.widthScale = containerWidth / standardWidth;
  }
  if (isUseWidthScale.value) {
    scaleStatus.scale = scaleStatus.widthScale;
  } else {
    scaleStatus.scale = scaleStatus.heightScale;
  }
}, 1000);

// 窗口大小变化处理函数
const handleWindowResize = () => {
  // 使用 nextTick 确保 DOM 更新完成后再计算
  nextTick(() => {
    triggerRecalculation();
  });
};

// 生命周期钩子
onMounted(() => {
  // 监听浏览器窗口大小变化
  window.addEventListener("resize", handleWindowResize);
  triggerRecalculation();
  console.log("开始监听浏览器窗口大小变化");
});

onUnmounted(() => {
  // 清理窗口大小变化监听器
  window.removeEventListener("resize", handleWindowResize);
  console.log("停止监听浏览器窗口大小变化");
});
</script>
<style lang="scss" scoped>
.sandbox-preview-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  z-index: 99999;
  overflow: hidden;
  .sandbox-canvas-preview-area-item {
    position: absolute;
  }
}
</style>
