<!--
 * @Author: zhangzheng
 * @Date: 2025-10-28 10:43:51
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-28 14:46:09
 * @Description: 
-->
<template>
  <div class="sandbox-preview-panel" ref="sandboxPreviewPanelRef">
    <div
      class="sandbox-canvas-preview-area-item"
      v-for="item in editorDataStore.sandboxCanvas"
      :key="item.id"
      :id="item.id"
      :canvasId="item.id"
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
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useEditorDataStore } from "../store/editorData";

const editorDataStore = useEditorDataStore();
const sandboxPreviewPanelRef = ref<any>();

// 强制重新计算的触发器
const refreshTrigger = ref(0);

// 计算全局预览缩放比例（基于 sandboxCanvasStyle 的宽高）
const calculateGlobalPreviewScale = () => {
  // 依赖 refreshTrigger 来触发响应式更新
  refreshTrigger.value;
  const containerWidth =
    sandboxPreviewPanelRef.value?.offsetWidth || window.innerWidth;

  // 使用 sandboxCanvasStyle 中的宽度作为标准
  const standardWidth = editorDataStore.sandboxCanvasStyle.width;

  // 基于 sandboxCanvasStyle 宽度计算全局缩放比例
  return containerWidth / standardWidth;
};

const getPreviewAreaItemStyle = (style: any) => {
  // 获取预览容器尺寸
  const containerWidth =
    sandboxPreviewPanelRef.value?.offsetWidth || window.innerWidth;

  // 计算原始画布尺寸
  const originalCanvasWidth = style.width || 400;
  const originalCanvasHeight = style.height || 600; // 默认高度

  // 使用全局缩放比例（基于 sandboxCanvasStyle 的宽高）
  const finalScale = calculateGlobalPreviewScale();

  // 计算缩放后的画布尺寸（只涉及宽高）
  const scaledWidth = originalCanvasWidth * finalScale;
  const scaledHeight = originalCanvasHeight * finalScale;

  // 定位计算：根据预览容器尺寸重新定位画布
  let positionLeft: number;
  let positionTop: number;

  // 处理不同的定位方式
  if (style.floatPosition === "left") {
    positionLeft = style.left || 0;
  } else if (style.floatPosition === "right") {
    positionLeft = containerWidth - scaledWidth - (style.right || 0);
  } else if (style.aligin === "center") {
    positionLeft = (containerWidth - scaledWidth) / 2;
  } else {
    // 默认定位：按比例缩放原始位置
    positionLeft = (style.left || 0) * finalScale;
  }

  positionTop = (style.top || 0) * finalScale;

  const resultStyle: any = {};
  resultStyle.width = `${Math.floor(scaledWidth)}px`;
  resultStyle.height = `${Math.floor(scaledHeight)}px`;
  resultStyle.top = `${Math.floor(positionTop)}px`;
  resultStyle.left = `${Math.floor(positionLeft)}px`;

  if (style.borderRadius) {
    const scaledBorderRadius = (style.borderRadius || 0) * finalScale;
    resultStyle.borderRadius = `${Math.floor(scaledBorderRadius)}px`;
  }

  return resultStyle;
};

const getShapeItemStyleForComponent = (componentItem: any) => {
  // 获取父级画布的缩放信息
  const parentCanvas = Object.values(editorDataStore.sandboxCanvas).find(
    (canvas: any) =>
      canvas.components.some((comp: any) => comp.id === componentItem.id)
  ) as any;

  if (!parentCanvas) return {};

  // 使用全局缩放比例（基于 sandboxCanvasStyle 的宽高）
  const finalScale = calculateGlobalPreviewScale();

  // 组件定位：根据预览容器尺寸重新定位组件在画布内的位置
  const scaledLeft = (componentItem.style.left || 0) * finalScale;
  const scaledTop = (componentItem.style.top || 0) * finalScale;

  return {
    position: "absolute" as const,
    width: `${componentItem.style.width || 0}px`, // 原始宽度：缩放通过 transform 处理
    height: `${componentItem.style.height || 0}px`, // 原始高度：缩放通过 transform 处理
    left: `${Math.floor(scaledLeft)}px`, // 重新定位：根据容器尺寸计算
    top: `${Math.floor(scaledTop)}px`, // 重新定位：根据容器尺寸计算
    transform: `scale(${finalScale})`, // 统一缩放：保持宽高比
    transformOrigin: "top left" as const,
  };
};

const getComponentStyle = (style: any) => {
  return {};
};

// 触发重新计算
const triggerRecalculation = () => {
  refreshTrigger.value++;
  console.log(`预览面板尺寸变化，触发重新计算: ${refreshTrigger.value}`);
};

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
