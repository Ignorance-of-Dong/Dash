<!--
 * @Author: zhangzheng
 * @Date: 2025-09-29 14:37:35
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-20 18:42:43
 * @Description: 仪表板编辑器主组件 - 提供画布编辑、组件拖拽、标尺显示等核心功能
-->
<template>
  <!-- 仪表板编辑器主容器 -->
  <div ref="editorLayoutRef" class="dashboard-editor-layout">
    <!-- 顶部工具栏 -->
    <DashEditorHeader
      @recover-to-published="handleRecoverToPublished"
      @preview="handlePreview"
    />

    <!-- 分割线 -->
    <div class="editor-divider" />

    <!-- 主编辑区域容器 -->
    <el-container
      element-loading-background="rgba(0, 0, 0, 0)"
      class="editor-container"
    >
      <!-- 画布中心区域 -->
      <main id="editor-main-center" class="editor-center" ref="canvasCenterRef">
        <!-- 水平标尺 -->
        <EditorRuler
          ref="horizontalRulerRef"
          direction="horizontal"
          @update:tick-size="handleHorizontalTickSizeUpdate"
        />

        <!-- 垂直标尺 -->
        <EditorRuler
          ref="verticalRulerRef"
          direction="vertical"
          :size="canvasMainHeight"
          @update:tick-size="handleVerticalTickSizeUpdate"
        />

        <!-- 画布滚动容器 -->
        <el-scrollbar
          ref="canvasScrollbarRef"
          @scroll="handleCanvasScroll"
          class="canvas-content"
          @mousedown="handleCanvasMouseDown"
          @mouseup="handleCanvasMouseUp"
          @mousemove="handleCanvasMouseMove"
          @mouseleave="handleCanvasMouseLeave"
          id="canvasScrollContainer"
        >
          <!-- 画布外层容器 -->
          <div
            id="canvas-outer-container"
            ref="canvasOuterRef"
            :style="canvasContainerStyle"
            @mousedown="handleMouseDown"
          >
            <!-- 空格键拖拽遮罩 -->
            <div v-if="isSpaceKeyPressed" class="canvas-drag-overlay"></div>

            <!-- 画布内层容器 -->
            <div class="canvas-inner-container">
              <!-- 画布核心组件 -->
              <div
                class="canvas-core-container"
                @drop="handleComponentDrop"
                @dragover="handleComponentDragOver"
              >
                <EditorCanvasCore
                  class="canvas-core editor-main"
                  ref="canvasCoreRef"
                  :canvas-id="editorState.canvasId"
                  :componentData="componentData"
                  :canvas-style-data="canvasStyleData"
                />
              </div>
            </div>
          </div>
        </el-scrollbar>

        <!-- 组件工具栏 -->
        <EditorToolBar />
      </main>
    </el-container>
    <EditorPreview v-if="isPreviewMode" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  nextTick,
  type CSSProperties,
} from "vue";
import { storeToRefs } from "pinia";
import { v4 as uuidv4 } from "uuid";
import EditorPreview from "./components/EditorPreview.vue";

// 组件导入
import DashEditorHeader from "./DashEditorHeader.vue";
import EditorRuler from "./components/EditorRuler.vue";
import EditorCanvasCore from "./components/EditorCanvasCore.vue";
import EditorToolBar from "./components/EditorToolBar.vue";

// Store 导入
import { useEditorDataStore } from "./store/editorData";

// 工具函数导入
import { shortcutKey } from "./utils/keyboardShortcuts";
import { useEmitt } from "./hooks/useEmitt";
import { findDragComponent } from "./utils/componentFinder";
import { changeComponentSizeWithScale } from "./utils/componentScaleAdapter";

// 类型导入
import type { DragState, EditorState, ScrollEvent } from "./types";
import { EDITOR_CONSTANTS } from "./types";
import { componentList } from "./cursorComponent/config";
// ==================== Store 和响应式数据 ====================

import { clone } from "ramda";

const editorDataStore = useEditorDataStore();

// 从主数据 Store 解构响应式数据
const { componentData, canvasStyleData, editMode, editorMap, isSpaceDown } =
  storeToRefs(editorDataStore);

// 从组合 Store 解构响应式数据

// ==================== 组件引用 ====================

/** 编辑器布局容器引用 */
const editorLayoutRef = ref<HTMLElement | null>(null);
/** 画布中心区域引用 */
const canvasCenterRef = ref<HTMLElement | null>(null);
/** 画布滚动容器引用 */
const canvasScrollbarRef = ref<any>(null);
/** 画布外层容器引用 */
const canvasOuterRef = ref<HTMLElement | null>(null);
/** 画布核心组件引用 */
const canvasCoreRef = ref<any>(null);
/** 水平标尺引用 */
const horizontalRulerRef = ref<any>(null);
/** 垂直标尺引用 */
const verticalRulerRef = ref<any>(null);

// ==================== 响应式状态 ====================

/** 是否为预览模式 */
const isPreviewMode = ref<boolean>(false);

/** 画布主要高度 */
const canvasMainHeight = ref<number>(300);

/** 拖拽状态 */
const dragState = reactive<DragState>({
  isDragging: false,
  startX: 0,
  startY: 0,
  scrollLeft: 0,
  scrollTop: 0,
});

/** 编辑器状态 */
const editorState = reactive<EditorState>({
  sideShow: true,
  countTime: 0,
  datasetTree: [],
  scaleHistory: null,
  canvasId: "canvas-main",
  canvasInitStatus: false,
  sourcePid: null,
  resourceId: null,
  opt: null,
  baseWidth: 10,
  baseHeight: 10,
});

// ==================== 计算属性 ====================

/** 空格键是否按下（重命名以提高可读性） */
const isSpaceKeyPressed = computed<boolean>(() => isSpaceDown.value);

/**
 * 滚动偏移量
 * 根据画布缩放比例动态调整滚动偏移系数
 */
const scrollOffset = computed<number>(() =>
  canvasStyleData.value.scale < EDITOR_CONSTANTS.SCALE_THRESHOLD
    ? EDITOR_CONSTANTS.SCROLL_OFFSET_SMALL
    : EDITOR_CONSTANTS.SCROLL_OFFSET_LARGE
);

/**
 * 画布容器样式
 * 根据编辑模式和缩放比例计算画布容器的样式
 */
const canvasContainerStyle = computed<CSSProperties>(() => {
  const { width, height } = canvasStyleData.value;

  if (editMode.value === "preview") {
    return {
      width: "100%",
      height: "auto",
      overflow: "hidden",
    };
  }

  return {
    minWidth: `${EDITOR_CONSTANTS.MIN_CANVAS_WIDTH}px`,
    width: `${width * scrollOffset.value}px`,
    height: `${height * scrollOffset.value}px`,
  };
});

// ==================== 工具函数 ====================

/**
 * 格式化标尺刻度标签
 * @param value 刻度值
 * @returns 格式化后的标签字符串
 */
const formatRulerTick = (value: number): string => {
  return value.toString();
};

/**
 * 初始化画布滚动位置
 * 将画布滚动到合适的初始位置，确保画布居中显示
 */
const initializeCanvasScroll = (): void => {
  nextTick(() => {
    if (!canvasCenterRef.value || !canvasScrollbarRef.value) {
      return;
    }

    try {
      const { width, height } = canvasStyleData.value;
      const mainWidth = canvasCenterRef.value.clientWidth;
      canvasMainHeight.value = canvasCenterRef.value.clientHeight;

      // 计算居中滚动位置
      const scrollX = (scrollOffset.value * width - mainWidth) / 2;
      const scrollY =
        (scrollOffset.value * height - canvasMainHeight.value) / 2 +
        EDITOR_CONSTANTS.INITIAL_SCROLL_Y_OFFSET;

      // 设置画布初始滚动条位置
      canvasScrollbarRef.value.scrollTo(scrollX, scrollY);
    } catch (error) {
      console.error("初始化画布滚动位置失败:", error);
    }
  });
};

// ==================== 事件处理函数 ====================

/**
 * 处理画布鼠标按下事件
 * 仅在空格键按下时启用拖拽功能
 */
const handleCanvasMouseDown = (e: MouseEvent): void => {
  if (!isSpaceKeyPressed.value || !canvasScrollbarRef.value) {
    return;
  }

  try {
    dragState.isDragging = true;
    dragState.startX = e.pageX - canvasScrollbarRef.value.wrapRef.offsetLeft;
    dragState.startY = e.pageY - canvasScrollbarRef.value.wrapRef.offsetTop;
    dragState.scrollLeft = canvasScrollbarRef.value.wrapRef.scrollLeft;
    dragState.scrollTop = canvasScrollbarRef.value.wrapRef.scrollTop;

    e.preventDefault();
    e.stopPropagation();
  } catch (error) {
    console.error("处理画布鼠标按下事件失败:", error);
  }
};

/**
 * 处理画布鼠标抬起事件
 * 停止拖拽操作
 */
const handleCanvasMouseUp = (): void => {
  dragState.isDragging = false;
};

/**
 * 处理画布鼠标离开事件
 * 停止拖拽操作
 */
const handleCanvasMouseLeave = (): void => {
  dragState.isDragging = false;
};

/**
 * 处理画布鼠标移动事件
 * 实现空格键拖拽画布功能
 */
const handleCanvasMouseMove = (e: MouseEvent): void => {
  if (!dragState.isDragging || !canvasScrollbarRef.value) {
    return;
  }

  try {
    e.preventDefault();
    e.stopPropagation();

    const x = e.pageX - canvasScrollbarRef.value.wrapRef.offsetLeft;
    const y = e.pageY - canvasScrollbarRef.value.wrapRef.offsetTop;
    const walkX = x - dragState.startX;
    const walkY = y - dragState.startY;

    canvasScrollbarRef.value.wrapRef.scrollLeft = dragState.scrollLeft - walkX;
    canvasScrollbarRef.value.wrapRef.scrollTop = dragState.scrollTop - walkY;
  } catch (error) {
    console.error("处理画布鼠标移动事件失败:", error);
  }
};

/**
 * 处理画布滚动事件
 * 同步标尺滚动位置
 */
const handleCanvasScroll = (e: ScrollEvent): void => {
  try {
    horizontalRulerRef.value?.rulerScroll(e);
    verticalRulerRef.value?.rulerScroll(e);
  } catch (error) {
    console.error("处理画布滚动事件失败:", error);
  }
};

/**
 * 处理组件拖拽放置事件
 * 将拖拽的组件添加到画布中
 */
const handleComponentDrop = async (e: DragEvent): Promise<void> => {
  try {
    e.preventDefault();
    e.stopPropagation();

    const componentInfo = e.dataTransfer?.getData("id");
    if (!componentInfo) {
      console.warn("未获取到组件信息");
      return;
    }

    await nextTick();
    console.log(editorMap.value);

    // 获取画布容器的位置信息
    const canvasElement = editorMap.value[editorState.canvasId];
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
    component.id = uuidv4();
    // 根据当前缩放比例调整组件大小
    changeComponentSizeWithScale(component, canvasStyleData.value.scale);

    // 添加组件到画布
    editorDataStore.addComponent({
      component,
      index: undefined,
    });

    // TODO: 添加快照记录功能
    // snapshotStore.recordSnapshotCache('renderChart', component.id)

    console.log("组件添加成功:", componentData.value);
  } catch (error) {
    console.error("处理组件拖拽放置失败:", error);
  }
};

/**
 * 处理组件拖拽悬停事件
 * 设置拖拽效果为复制
 */
const handleComponentDragOver = (e: DragEvent): void => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
};

/**
 * 处理取消选择当前组件事件
 * 点击画布空白区域时取消组件选择
 */
const handleDeselectComponent = (): void => {
  // 预留实现
};

/**
 * 处理水平标尺刻度大小更新事件
 * @param tickSize 新的刻度大小
 */
const handleHorizontalTickSizeUpdate = (tickSize: number): void => {
  editorState.baseWidth = tickSize;
};

/**
 * 处理垂直标尺刻度大小更新事件
 * @param tickSize 新的刻度大小
 */
const handleVerticalTickSizeUpdate = (tickSize: number): void => {
  editorState.baseHeight = tickSize;
};

/**
 * 处理恢复到已发布状态事件
 * 从工具栏触发的恢复操作
 */
const handleRecoverToPublished = (): void => {
  console.log("恢复到已发布状态");
  // TODO: 实现恢复逻辑
};

// ==================== 生命周期钩子 ====================

/**
 * 组件挂载后的初始化操作
 */
onMounted(() => {
  try {
    // 初始化快捷键监听
    shortcutKey().listenGlobalKeyDown();

    // 初始化画布滚动位置
    initializeCanvasScroll();

    // 注册滚动初始化事件监听
    useEmitt({
      name: "initScroll",
      callback: () => {
        console.log("重新初始化滚动位置");
        initializeCanvasScroll();
      },
    });

    console.log("仪表板编辑器初始化完成");
  } catch (error) {
    console.error("仪表板编辑器初始化失败:", error);
  }
});

const handleMouseDown = (e: MouseEvent): void => {
  // e.stopPropagation()
  if (isSpaceDown.value) {
    return;
  }
  editorDataStore.setCurComponent({ component: null, index: null });
};

const handlePreview = () => {
  isPreviewMode.value = true;
};

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      isPreviewMode.value = false;
    }
  });
});

// ==================== 组件暴露 ====================

/**
 * 暴露给父组件的方法和属性
 */
defineExpose({
  /** 初始化画布滚动位置 */
  initializeCanvasScroll,
  /** 编辑器状态 */
  editorState,
  /** 画布容器引用 */
  canvasScrollbarRef,
  /** 画布核心组件引用 */
  canvasCoreRef,
});
</script>
<style lang="scss" scoped>
/* ==================== 主题变量 ==================== */
$editor-bg-color: rgba(51, 51, 51, 1);
$divider-color: #000;
$drag-overlay-opacity: 0.3;
$header-height: 64px;
$divider-height: 1px;

/* ==================== 主布局 ==================== */
.dashboard-editor-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-container {
  height: calc(100vh - #{$header-height} - #{$divider-height});
  flex: 1;

  &.preview-container {
    opacity: 1;
  }
}

.editor-center {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  position: relative;
  background-color: $editor-bg-color;
  overflow: hidden;
}

/* ==================== 画布区域 ==================== */
.canvas-content {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: auto;
  margin: auto;
  transition: all 0.3s ease-in-out;

  &.preview-content {
    transform: scale(1);
  }

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.canvas-inner-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .canvas-core-container {
    position: relative;
  }
}

.canvas-core {
  width: 100%;
  height: 100%;

  &.editor-main {
    position: relative;
  }
}

/* ==================== 分割线 ==================== */
.editor-divider {
  width: 100%;
  height: $divider-height;
  background: $divider-color;
  flex-shrink: 0;
}

/* ==================== 拖拽遮罩 ==================== */
.canvas-drag-overlay {
  position: absolute;
  z-index: 1;
  opacity: 0.3;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 768px) {
  .dashboard-editor-layout {
    font-size: 14px;
  }

  .editor-center {
    padding: 4px;
  }
}

.preview-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  z-index: 99999;
}
</style>
