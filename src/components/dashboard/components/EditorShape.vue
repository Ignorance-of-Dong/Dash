<!--
 * @Author: zhangzheng
 * @Date: 2025-10-14 17:28:22
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-28 18:11:25
-->
<template>
  <div
    class="editor-shape-container"
    :id="domId"
    ref="shapeInnerRef"
    @mousedown="handleInnerMouseDownOnShape"
  >
    <div
      v-for="item in isActive() ? pointList : []"
      :key="item"
      class="editor-shape-point"
      :style="getPointStyle(item)"
      @mousedown="handleMouseDownOnPoint(item, $event)"
    ></div>
    <div class="editor-shape-inner">
      <span :style="{ position: 'absolute', top: 0, left: 0 }">{{
        element.id
      }}</span>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useEditorDataStore } from "../store/editorData";
import calculateSimpleComponentPositionAndSize from "../utils/simpleCalc";
import type {
  ResizePointPosition,
  CursorStyle,
  ResizePointStyle,
} from "../types";
import { CANVAS_CONSTANTS } from "../types";
import { watch } from "vue";
import { positionChange, reArrangeComponents } from "../utils/correction";
import { clone } from "ramda";
const props = defineProps<{
  element: any;
  defaultStyle: any;
  canvasId: string;
  index: number;
}>();

const domId = ref("shape-id-" + props.element.id);

const pointList: ResizePointPosition[] = [...CANVAS_CONSTANTS.RESIZE_POINTS];
const editorDataStore = useEditorDataStore();
const active = computed(() => {
  return editorDataStore.curComponent?.id === props.element.id;
});
const isActive = () => {
  return (
    active.value &&
    !props.element["isLock"] &&
    editorDataStore.editMode === "edit"
  );
};

/**
 * 获取调整点的样式
 * @param point 调整点位置
 * @returns 调整点样式对象
 */
const getPointStyle = (point: ResizePointPosition): ResizePointStyle => {
  let { width, height } = props.element.style;

  // 如果是沙盒模式，需要应用缩放比例
  if (editorDataStore.mode === "sandbox") {
    const canvasScale = editorDataStore.sandboxCanvasStyle.scale || 1;
    width = width * canvasScale;
    height = height * canvasScale;
  }

  width = width - 2;
  height = height - 2;

  const hasT = /t/.test(point);
  const hasB = /b/.test(point);
  const hasL = /l/.test(point);
  const hasR = /r/.test(point);

  let newLeft = 0;
  let newTop = 0;

  // 四个角的点
  if (point.length === 2) {
    newLeft = hasL ? 0 : width;
    newTop = hasT ? 0 : height;
  } else {
    // 上下两点的点，宽度居中
    if (hasT || hasB) {
      newLeft = width / 2;
      newTop = hasT ? 0 : height;
    }

    // 左右两边的点，高度居中
    if (hasL || hasR) {
      newLeft = hasL ? 0 : width;
      newTop = Math.floor(height / 2);
    }
  }

  // 根据调整点位置确定鼠标光标样式
  const cursor = getCursorStyle(point);

  const style: ResizePointStyle = {
    marginLeft: "-4px",
    marginTop: "-4px",
    left: `${newLeft}px`,
    top: `${newTop}px`,
    cursor,
  };

  return style;
};

/**
 * 根据调整点位置获取对应的鼠标光标样式
 * @param point 调整点位置
 * @returns 鼠标光标样式
 */
const getCursorStyle = (point: ResizePointPosition): CursorStyle => {
  const cursorMap: Record<ResizePointPosition, CursorStyle> = {
    lt: "nw-resize", // 左上角 - 西北方向调整
    t: "n-resize", // 上边 - 北方向调整
    rt: "ne-resize", // 右上角 - 东北方向调整
    r: "e-resize", // 右边 - 东方向调整
    rb: "se-resize", // 右下角 - 东南方向调整
    b: "s-resize", // 下边 - 南方向调整
    lb: "sw-resize", // 左下角 - 西南方向调整
    l: "w-resize", // 左边 - 西方向调整
  };

  return cursorMap[point] || "default";
};

/**
 * 处理调整点的鼠标按下事件
 * @param point 调整点位置
 * @param e 鼠标事件
 */
const handleMouseDownOnPoint = (
  point: ResizePointPosition,
  e: MouseEvent | any
) => {
  // 阻止事件冒泡
  e.preventDefault();
  e.stopPropagation();

  // 复制样式对象，避免直接修改原对象
  const style = { ...props.defaultStyle };

  // 获取缩放比例
  const canvasStyleScale =
    editorDataStore.mode === "sandbox"
      ? editorDataStore.sandboxCanvasStyle.scale || 1
      : 1;

  // 组件中心点（基于真实坐标）
  const center = {
    x: style.left + style.width / 2,
    y: style.top + style.height / 2,
  };

  // 获取画布位移信息
  const editorRectInfo =
    editorDataStore.editorMap[props.canvasId]?.getBoundingClientRect();
  if (!editorRectInfo) {
    return;
  }

  // 获取调整点的位置信息
  const pointRect = e.target?.getBoundingClientRect();

  // 当前点击圆点相对于画布的坐标（需要反推为真实坐标）
  const curPoint = {
    x: Math.round(
      (pointRect.left - editorRectInfo.left + e.target.offsetWidth / 2) /
        canvasStyleScale
    ),
    y: Math.round(
      (pointRect.top - editorRectInfo.top + e.target.offsetHeight / 2) /
        canvasStyleScale
    ),
  };

  // 获取对称点的坐标（基于真实坐标计算）
  const symmetricPoint = {
    x: center.x - (curPoint.x - center.x),
    y: center.y - (curPoint.y - center.y),
  };

  let isFirst = true;

  // 鼠标移动处理函数
  const handleMouseMove = (moveEvent: MouseEvent) => {
    if (isFirst) {
      isFirst = false;
      return;
    }

    // 获取缩放比例
    const canvasStyleScale =
      editorDataStore.mode === "sandbox"
        ? editorDataStore.sandboxCanvasStyle.scale || 1
        : 1;

    // 计算当前鼠标位置相对于画布的坐标（需要反推为真实坐标）
    const curPosition = {
      x:
        (moveEvent.clientX - Math.round(editorRectInfo.left)) /
        canvasStyleScale,
      y:
        (moveEvent.clientY - Math.round(editorRectInfo.top)) / canvasStyleScale,
    };

    // 使用简化版本的计算函数（不包含旋转和比例锁定逻辑）
    const editorCanvas = editorDataStore.editorMap[props.canvasId];
    const clientRect = editorCanvas.getBoundingClientRect();
    const canvasData = editorDataStore.sandboxCanvas[props.canvasId];

    // 反推真实画布尺寸用于计算
    const realClientRect = {
      ...clientRect,
      width: clientRect.width / canvasStyleScale,
      height: clientRect.height / canvasStyleScale,
    };

    calculateSimpleComponentPositionAndSize(
      realClientRect,
      point,
      style,
      curPosition,
      {
        center,
        curPoint,
        symmetricPoint,
      },
      editorDataStore.mode,
      canvasData
    );

    editorDataStore.setDragStatus("dragIn");

    if (editorDataStore.mode == "sandbox") {
      if (canvasData.layout == "vertical") {
        reArrangeComponents(canvasData, canvasData.layout);
        const componentLength = canvasData?.components.length;

        const totalComponentHeight = canvasData.components
          .filter((component) => component.id !== props.element.id)
          .reduce((acc, component) => acc + component.style.height, 0);
        const totalGapHeight =
          componentLength >= 2
            ? (componentLength - 1) * canvasData?.componentGap
            : 0;

        // 使用真实画布高度（realClientRect 已经反推为真实尺寸）
        const totalOccupiedAraeHeight =
          realClientRect.height -
          totalComponentHeight -
          style.height -
          totalGapHeight;
        if (totalOccupiedAraeHeight <= 0) {
          return;
        }
      }
    }

    // 更新组件样式（这里的 style 是真实坐标，未经过缩放）✅
    Object.assign(props.element.style, style);
  };

  // 鼠标释放处理函数
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    editorDataStore.setDragStatus("idle");

    // if (editorDataStore.mode == "sandbox") {
    //   const canvasData = editorDataStore.sandboxCanvas[props.canvasId];
    //   reArrangeComponents(canvasData, canvasData.layout);
    // }
    // 调整完成后的回调处理
    console.log("调整完成:", style);
  };

  // 添加全局鼠标事件监听
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const shapeInnerRef = ref();
const handleInnerMouseDownOnShape = (e) => {
  editorDataStore.setCurComponent({
    component: props.element,
    index: props.index,
  });
  e.stopPropagation();
  const originalStyle = clone(props.defaultStyle);
  const pos = { ...props.defaultStyle };
  const startY = e.clientY;
  const startX = e.clientX;

  const offsetY = e.offsetY;
  const offsetX = e.offsetX;

  //   left 边界
  const leftBoundary = 0;
  //   top 边界
  const topBoundary = 0;
  const editorCanvas = editorDataStore.editorMap[props.canvasId];

  //   额外空间

  // 如果直接修改属性，值的类型会变为字符串，所以要转为数值型
  const startTop = Number(pos["top"]);
  const startLeft = Number(pos["left"]);
  let isFirst = true;

  let hasMove = false;
  const move = (moveEvent) => {
    if (isFirst) {
      isFirst = false;
      return;
    }
    editorDataStore.setDragStatus("dragIn", props.canvasId);
    const clientRect = editorCanvas.getBoundingClientRect();

    // 获取缩放比例
    const canvasStyleScale =
      editorDataStore.mode === "sandbox"
        ? editorDataStore.sandboxCanvasStyle.scale || 1
        : 1;

    hasMove = true;
    const curX = moveEvent.clientX;
    const curY = moveEvent.clientY;

    // 计算移动距离并反推为真实距离
    let top = (curY - startY) / canvasStyleScale + startTop;
    let left = (curX - startX) / canvasStyleScale + startLeft;

    // 反推真实画布尺寸用于边界判断
    const realWidth = clientRect.width / canvasStyleScale;
    const realHeight = clientRect.height / canvasStyleScale;

    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left > realWidth - pos.width) {
      left = realWidth - pos.width;
    }
    if (top > realHeight - pos.height) {
      top = realHeight - pos.height;
    }
    pos["top"] = top;
    pos["left"] = left;

    editorDataStore.setShapeStyle(pos);
  };

  const up = () => {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
    console.log("[ components ] >", editorDataStore.componentData);

    if (editorDataStore.mode == "sandbox") {
      const canvasData = editorDataStore.sandboxCanvas[props.canvasId];
      const resultStyle = positionChange(
        originalStyle,
        pos,
        canvasData,
        props.element.id
      );
      console.log("[ resultStyle ] >", resultStyle);
      editorDataStore.setShapeStyle(resultStyle as any);
      reArrangeComponents(canvasData, canvasData.layout);
    }
    editorDataStore.setDragStatus("idle");
  };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
};
</script>

<style scoped>
.editor-shape-container {
  position: absolute;
  .editor-shape-point {
    position: absolute;
    background: #fff;
    border: 1px solid #59c7f9;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    z-index: 1;
  }
}
.editor-shape-inner {
  width: 100%;
  height: 100%;
  position: relative;
  background-size: 100% 100% !important;
}
</style>
