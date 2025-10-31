<!--
 * @Author: zhangzheng
 * @Date: 2025-09-29 15:57:43
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-28 17:25:43
 * @Description: 编辑器画布核心组件 - 负责渲染画布和组件
-->

<template>
  <div
    :id="editorDomId"
    ref="canvasContainer"
    class="editor-canvas"
    :class="canvasClasses"
    :style="canvasStyle"
    :canvasId="canvasId"
  >
    <!-- 沙盘可拖拽区域预显示 -->

    <EditorShape
      v-for="(componentItem, componentIndex) in componentData"
      :id="componentItem.id"
      :canvas-id="canvasId"
      :scale="canvasScale"
      :key="componentItem.id"
      :default-style="componentItem.style"
      :style="getShapeItemStyleForComponent(componentItem)"
      :element="componentItem"
      :index="componentIndex"
      :class="getShapeClasses(componentItem)"
    >
      <component
        :is="componentItem.component"
        :id="getComponentDomId(componentItem.id)"
        :scale="canvasScale"
        :style="getComponentStyle(componentItem.style)"
        :element="componentItem"
      />
    </EditorShape>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRefs, withDefaults } from "vue";
import type { Ref } from "vue";
import type {
  EditorCanvasCoreProps,
  ComponentData,
  CanvasComponentStyle,
  EditMode,
} from "../types";
import { CANVAS_CONSTANTS } from "../types";
// 样式工具函数
import { getCanvasStyle, getShapeItemStyle, getStyle } from "../utils/style";
import { changeStyleWithScale } from "../utils/translate";
import { useEditorDataStore } from "../store/editorData";
import EditorShape from "./EditorShape.vue";
import { SANDBOX_EDITOR_DEFAULT_PREVIEW_AREA_ITEM } from "../config";

// Props 定义
const props = withDefaults(defineProps<EditorCanvasCoreProps>(), {
  canvasId: CANVAS_CONSTANTS.DEFAULT_CANVAS_ID,
  componentData: () => [] as ComponentData[],
});

// Store 实例
const editorDataStore = useEditorDataStore();
// 直接使用store中的响应式数据
const editMode = computed(() => editorDataStore.editMode as EditMode);

// 响应式 Props
const { canvasId, canvasStyleData } = toRefs(props);

// 计算属性
/** 画布缩放比例 */
const canvasScale = computed<number>(() => {
  return canvasStyleData.value.scale / 100;
});

/** 编辑器DOM ID */
const editorDomId = computed<string>(() => {
  return `${CANVAS_CONSTANTS.EDITOR_DOM_PREFIX}${canvasId.value}`;
});

/** 画布样式 */
const canvasStyle = computed(() => {
  const baseStyle = getCanvasStyle(canvasStyleData.value, canvasId.value);
  if (editorDataStore.mode === "sandbox") {
    return {
      ...baseStyle,
      width: `100%`,
      height: `100%`,
    };
  } else {
    const scaledWidth = changeStyleWithScale(
      canvasStyleData.value.width,
      canvasStyleData.value.scale
    );
    const scaledHeight = changeStyleWithScale(
      canvasStyleData.value.height,
      canvasStyleData.value.scale
    );

    return {
      ...baseStyle,
      width: `${scaledWidth}px`,
      height: `${scaledHeight}px`,
    };
  }
});

/** 画布CSS类 */
const canvasClasses = computed(() => ({
  "editor-canvas--edit": editMode.value === "edit",
  "editor-canvas--preview": editMode.value === "preview",
}));

// 方法
/** 获取形状项样式 */
const getShapeItemStyleForComponent = (componentItem: ComponentData) => {
  // 获取基础样式（不修改原始数据）
  const baseStyle = getShapeItemStyle(componentItem);

  // 如果是沙盒模式，需要应用 sandboxCanvasStyle 缩放比例
  if (editorDataStore.mode === "sandbox") {
    // 使用 sandboxCanvasStyle 中的缩放比例
    const canvasScale = editorDataStore.sandboxCanvasStyle.scale || 1;

    // 应用缩放比例到样式（只修改返回值，不修改原始数据）
    if (canvasScale !== 1 && componentItem.style) {
      const scaledStyle = { ...baseStyle };

      // 缩放位置和尺寸（添加安全检查）
      if (componentItem.style.width !== undefined) {
        scaledStyle.width = `${componentItem.style.width * canvasScale}px`;
      }
      if (componentItem.style.height !== undefined) {
        scaledStyle.height = `${componentItem.style.height * canvasScale}px`;
      }
      if (componentItem.style.left !== undefined) {
        scaledStyle.left = `${componentItem.style.left * canvasScale}px`;
      }
      if (componentItem.style.top !== undefined) {
        scaledStyle.top = `${componentItem.style.top * canvasScale}px`;
      }

      return scaledStyle;
    }
  }

  return baseStyle;
};

/** 获取组件样式 */
const getComponentStyle = (style: CanvasComponentStyle) => {
  // return getStyle(style) || {};
  return {};
};

/** 获取形状CSS类 */
const getShapeClasses = (componentItem: ComponentData) => ({
  "shape--locked": componentItem.isLock && editMode.value === "edit",
  "shape--editing": componentItem.editing,
  "shape--resizing": componentItem.resizing,
  "shape--dragging": componentItem.dragging,
});

/** 获取组件DOM ID */
const getComponentDomId = (componentId: string): string => {
  return `${CANVAS_CONSTANTS.COMPONENT_DOM_PREFIX}${componentId}`;
};

// 生命周期
onMounted(() => {
  // 初始化编辑器DOM引用
  editorDataStore.getEditor(canvasId.value);
});
</script>

<style lang="scss" scoped>
.editor-canvas {
  position: relative;
  margin: auto;
  background-size: 100% 100% !important;

  // 编辑模式样式
  &--edit {
    cursor: default;
  }

  // 预览模式样式
  &--preview {
    pointer-events: none;
  }
}

// 形状组件样式
:deep(.shape--locked) {
  opacity: 0.5;

  &:hover {
    cursor: not-allowed;
  }
}

:deep(.shape--editing) {
  border: 1px dashed #409eff;
}

:deep(.shape--resizing) {
  border: 1px solid #409eff;
}

:deep(.shape--dragging) {
  opacity: 0.8;
  z-index: 1000;
}
</style>
