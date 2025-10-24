<!--
 * @Author: zhangzheng
 * @Date: 2025-09-25 19:15:11
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-14 18:18:54
 * @Description: 编辑器标尺组件 - 用于显示画布的刻度尺和当前选中组件的位置阴影
-->

<template>
  <!-- 标尺外层容器 -->
  <div
    class="editor-ruler-outer"
    :style="editorOuterStyle"
    :class="{ 'editor-ruler-vertical': isVertical }"
    ref="editorRuleRef"
  >
    <!-- 标尺阴影层，用于遮挡滚动内容 -->
    <div class="editor-ruler-shadow" :style="editorOuterStyle" />

    <!-- 标尺滚动容器 -->
    <div :style="scrollContainerStyle" class="editor-ruler-outer-scroll">
      <!-- 标尺主体 -->
      <div class="editor-ruler" :style="{ width: `${scaledRulerWidth}px` }">
        <!-- 当前选中组件的位置阴影 -->
        <div
          v-if="shouldShowComponentShadow"
          :style="componentShadowStyle"
          class="editor-cur-shadow"
        />
        <div
          class="editor-ruler-line"
          :style="{ width: `${scaledRulerWidth}px` }"
        />
        <div
          v-for="(tick, index) in tickMarks"
          :key="`tick-${index}`"
          class="editor-ruler-tick"
          :class="{ 'long-tick': tick.isLong }"
          :style="{ left: `${tick.position}px` }"
        >
          <span v-if="tick.isLong" class="editor-tick-label">
            {{ tick.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from "vue";
import { useEditorDataStore } from "../store/editorData";
import { storeToRefs } from "pinia";

// 类型导入
import type {
  RulerDirection,
  TickMark,
  RulerProps,
  ComponentStyle,
} from "../types/ruler";
import { RULER_CONSTANTS } from "../types/ruler";

// ==================== 组件设置 ====================

const editorDataStore = useEditorDataStore();
const editorRuleRef = ref<HTMLElement | null>(null);

const props = withDefaults(defineProps<RulerProps>(), {
  tickLabelFormatter: (value: number) => value.toString(),
  size: 300,
  direction: "horizontal",
});

const emits = defineEmits<{
  "update:tickSize": [value: number];
}>();

// ==================== 响应式数据 ====================

const { canvasStyleData, curComponent, componentData } =
  storeToRefs(editorDataStore);

// ==================== 基础计算属性 ====================

/** 判断是否为垂直方向 */
const isVertical = computed((): boolean => props.direction === "vertical");

/** 标尺尺寸（宽度或高度） */
const rulerSize = computed((): number =>
  isVertical.value ? canvasStyleData.value.height : canvasStyleData.value.width
);

/** 当前缩放比例 */
const currentScale = computed((): number => canvasStyleData.value.scale);

/** 缩放后的标尺宽度 */
const scaledRulerWidth = computed(
  (): number => (rulerSize.value * currentScale.value) / 100
);

// ==================== 父组件样式计算 ====================

/**
 * 计算复合画布内部组件的偏移量
 * 用于处理嵌套组件（如 Group、Tab）的位置计算
 */
const parentComponentOffset = computed((): ComponentStyle => {
  const defaultOffset: ComponentStyle = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

  // 如果没有当前组件或者是主画布，返回默认偏移
  if (!curComponent.value || curComponent.value.canvasId === "canvas-main") {
    return defaultOffset;
  }

  // 查找父组件并计算偏移
  const parentComponent = componentData.value.find((item) =>
    curComponent.value?.canvasId.includes(item.id)
  );

  if (!parentComponent) {
    return defaultOffset;
  }

  const offset = {
    left: parentComponent.style.left,
    top: parentComponent.style.top,
    width: parentComponent.style.width,
    height: parentComponent.style.height,
  };

  return offset;
});

// ==================== 组件阴影样式 ====================

/** 当前选中组件的阴影样式 */
const componentShadowStyle = computed((): CSSProperties => {
  if (!curComponent.value) {
    return {};
  }

  const component = curComponent.value;

  // 根据标尺方向计算位置和尺寸
  const position = isVertical.value
    ? component.style.top
    : component.style.left;

  const size = isVertical.value
    ? component.style.height
    : component.style.width;

  return {
    left: `${position}px`,
    width: `${size}px`,
  };
});

/** 是否显示组件阴影 */
const shouldShowComponentShadow = computed((): boolean =>
  Boolean(curComponent.value && curComponent.value.category !== "hidden")
);

// ==================== 刻度计算 ====================

/** 标尺与画布宽度的比例 */
const aspectRatio = computed(
  (): number => rulerSize.value / canvasStyleData.value.width
);

/**
 * 计算刻度间隔
 * 根据缩放比例和标尺尺寸动态调整刻度密度
 */
const tickInterval = computed((): number => {
  const scaleFactor =
    (RULER_CONSTANTS.SCALE_BASE_FACTOR * aspectRatio.value) /
    (rulerSize.value * currentScale.value);

  return (
    RULER_CONSTANTS.MIN_TICK_INTERVAL * Math.max(Math.floor(scaleFactor), 1)
  );
});

/** 缩放后的刻度间隔 */
const scaledTickInterval = computed(
  (): number => (tickInterval.value * currentScale.value) / 100
);

/**
 * 生成刻度标记数组
 * 包含位置、标签和是否为长刻度的信息
 */
const tickMarks = computed((): TickMark[] => {
  const marks: TickMark[] = [];
  let currentValue = 0;

  while (currentValue <= rulerSize.value) {
    const isLong =
      currentValue %
        (RULER_CONSTANTS.LONG_TICK_INTERVAL * tickInterval.value) ===
      0;
    marks.push({
      position: (currentValue * currentScale.value) / 100,
      label: currentValue,
      isLong,
    });

    currentValue += tickInterval.value;
  }
  return marks;
});

// ==================== 样式计算 ====================

/** 滚动容器样式 */
const scrollContainerStyle = computed(
  (): CSSProperties => ({
    width: `${rulerSize.value * 1.5}px`,
  })
);

/** 标尺外层容器样式 */
const editorOuterStyle = computed(
  (): CSSProperties => ({
    width: isVertical.value
      ? `${props.size - RULER_CONSTANTS.RULER_HEIGHT}px`
      : "100%",
  })
);

// ==================== 方法定义 ====================

/**
 * 标尺滚动处理
 * @param e 滚动事件对象
 */
const rulerScroll = (e: { scrollLeft: number; scrollTop: number }): void => {
  const scrollPosition = isVertical.value ? e.scrollTop : e.scrollLeft;
  editorRuleRef.value?.scrollTo(scrollPosition, 0);
};

// ==================== 监听器 ====================

/**
 * 监听刻度间隔变化，通知父组件
 * 用于同步标尺刻度大小到其他相关组件
 */
watch(
  () => scaledTickInterval.value,
  (newTickSize: number) => {
    emits("update:tickSize", newTickSize);
  },
  { immediate: true }
);

// ==================== 组件暴露 ====================

/**
 * 暴露给父组件的方法和属性
 * 主要用于外部控制标尺滚动
 */
defineExpose({
  /** 标尺滚动方法 */
  rulerScroll,
  /** 标尺DOM引用 */
  editorRuleRef,
});
</script>

<style scoped lang="scss">
/* ==================== 标尺主题色彩变量 ==================== */
$ruler-bg-color: #2c2c2c;
$ruler-line-color: #ac2a2a;
$ruler-tick-color: #e38a8a;
$ruler-text-color: #fff;
$ruler-shadow-color: rgba(10, 123, 224, 0.3);
$ruler-height: 30px;

/* ==================== 垂直标尺样式 ==================== */
.editor-ruler-vertical {
  position: absolute;
  left: $ruler-height;
  top: $ruler-height;
  transform-origin: top left;
  transform: rotate(90deg);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 2;

  // 垂直标尺内部元素调整
  .ruler {
    .ruler-line {
      top: 0;
    }

    .ruler-tick {
      top: 0;

      .tick-label {
        color: $ruler-text-color;
        transform: rotate(180deg); // 垂直标尺文字需要旋转
      }
    }
  }
}

/* ==================== 标尺阴影层 ==================== */
.editor-ruler-shadow {
  position: absolute;
  height: $ruler-height;
  overflow: hidden;
  background-color: $ruler-bg-color;
}

/* ==================== 标尺外层容器 ==================== */
.editor-ruler-outer {
  overflow-x: auto;
  background-color: $ruler-bg-color;

  // 隐藏滚动条，保持界面简洁
  &::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
  }
}

/* ==================== 标尺滚动容器 ==================== */
.editor-ruler-outer-scroll {
  min-width: 1600px; // 最小宽度确保内容不会过窄
  display: flex;
  justify-content: center;
}

/* ==================== 标尺主体 ==================== */
.editor-ruler {
  position: relative;
  height: $ruler-height;
  display: flex;
  align-items: center;
  background-color: $ruler-bg-color;
}

/* ==================== 标尺基准线 ==================== */
.editor-ruler-line {
  position: absolute;
  bottom: 0;
  height: 1px;
  background-color: $ruler-line-color;
}

/* ==================== 标尺刻度 ==================== */
.editor-ruler-tick {
  position: absolute;
  bottom: 1px;
  height: 3px;
  width: 1px;
  background-color: $ruler-tick-color;

  // 长刻度样式
  &.long-tick {
    height: 15px;
  }
}

/* ==================== 刻度标签 ==================== */
.editor-tick-label {
  position: absolute;
  bottom: 2px;
  font-size: 8px;
  left: 3px;
  white-space: nowrap;
  color: $ruler-text-color;
  user-select: none; // 防止文字被选中
  pointer-events: none; // 防止鼠标事件干扰
}

/* ==================== 当前组件阴影 ==================== */
.editor-cur-shadow {
  background: $ruler-shadow-color;
  height: $ruler-height;
  position: absolute;
  border-radius: 2px;
  transition: all 0.2s ease-in-out; // 平滑过渡动画
  pointer-events: none; // 不阻挡鼠标事件
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 768px) {
  .editor-tick-label {
    font-size: 6px; // 小屏幕下字体更小
  }

  .editor-ruler-outer-scroll {
    min-width: 800px; // 小屏幕下减少最小宽度
  }
}
</style>
