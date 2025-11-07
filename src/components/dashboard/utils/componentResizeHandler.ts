/**
 * @Author: zhangzheng
 * @Date: 2025-10-15 18:40:00
 * @Description: 简化版本的组件调整大小计算函数（不包含旋转逻辑）
 */

import { ref } from "vue";
import type { ResizePointPosition, CanvasComponentStyle } from "../types";
import { adjustCanvasWidth, adjustComponentPosition } from "./canvasLayoutManager";
import { clone } from "ramda";

/** 点坐标接口 */
interface Point {
  x: number;
  y: number;
}

/** 调整点信息接口 */
interface PointInfo {
  center: Point;
  curPoint: Point;
  symmetricPoint: Point;
}

/** 计算函数映射 */
const calcFunctions: Record<ResizePointPosition, Function> = {
  lt: calculateLeftTop,
  t: calculateTop,
  rt: calculateRightTop,
  r: calculateRight,
  rb: calculateRightBottom,
  b: calculateBottom,
  lb: calculateLeftBottom,
  l: calculateLeft,
};

/**
 * 计算左上角调整（已完成）
 */
function calculateLeftTop(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint } = resizePointInfo;

  // 直接计算新的宽高（不考虑旋转）
  const newWidth = symmetricPoint.x - mousePosition.x;
  const newHeight = symmetricPoint.y - mousePosition.y;

  let resultWidth = Math.round(newWidth);
  let resultHeight = Math.round(newHeight);
  let resultLeft = Math.round(symmetricPoint.x - newWidth);
  let resultTop = Math.round(symmetricPoint.y - newHeight);
  if (resultLeft < 0) {
    resultLeft = 0;
    resultWidth = symmetricPoint.x - resultLeft;
  }
  if (resultTop < 0) {
    resultTop = 0;
    resultHeight = symmetricPoint.y - resultTop;
  }
  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = componentStyle.left || 0;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = componentStyle.top || 0;
  }
  let isChangeComponentStyle: any = true;
  if (editorMode == "sandbox") {
    isChangeComponentStyle = adjustComponentPosition(
      componentStyle,
      currentCanvasData,
      targetComponentId,
      "leftTop",
      {
        resultTop: resultTop,
        originalCanvasData: originalCanvasData,
      }
    );
    if (isChangeComponentStyle?.resultTop) {
      resultTop = isChangeComponentStyle.resultTop;
    }
    if (isChangeComponentStyle?.resultHeight) {
      resultHeight = isChangeComponentStyle.resultHeight;
    }
  }

  // 确保宽高为正数
  if (resultWidth > 0 && resultHeight > 0 && isChangeComponentStyle) {
    componentStyle.width = resultWidth;
    componentStyle.height = resultHeight;
    componentStyle.left = resultLeft;
    componentStyle.top = resultTop;
  }
}

/**
 * 计算右上角调整 (已完成)
 */
function calculateRightTop(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint } = resizePointInfo;

  const newWidth = mousePosition.x - symmetricPoint.x;
  const newHeight = symmetricPoint.y - mousePosition.y;

  let resultWidth = Math.round(newWidth);
  let resultHeight = Math.round(newHeight);
  let resultLeft = Math.round(symmetricPoint.x);
  let resultTop = Math.round(symmetricPoint.y - newHeight);

  const topSpace = resultTop < 0 ? 0 : resultTop;
  const bottomSpace = canvasClientRect.height - resultTop - resultHeight;

  // 正确
  if (
    mousePosition.x - symmetricPoint.x >
    canvasClientRect.width - resultLeft
  ) {
    resultWidth = canvasClientRect.width - resultLeft;
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = componentStyle.left || 0;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = componentStyle.top || 0;
  }

  let isChangeComponentStyle: any = true;
  if (editorMode == "sandbox") {
    isChangeComponentStyle = adjustComponentPosition(
      componentStyle,
      currentCanvasData,
      targetComponentId,
      "rightTop",
      {
        resultTop: resultTop,
        originalCanvasData: originalCanvasData,
      }
    );
    if (isChangeComponentStyle?.resultTop) {
      resultTop = isChangeComponentStyle.resultTop;
    }
    if (isChangeComponentStyle?.resultHeight) {
      resultHeight = isChangeComponentStyle.resultHeight;
    }
  }

  if (resultWidth > 0 && resultHeight > 0 && isChangeComponentStyle) {
    componentStyle.width = resultWidth;
    componentStyle.height = resultHeight;
    componentStyle.left = resultLeft;
    componentStyle.top = resultTop;
  }
}

/**
 * 计算右下角调整 (已完成)
 */
function calculateRightBottom(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint } = resizePointInfo;

  const newWidth = mousePosition.x - symmetricPoint.x;
  const newHeight = mousePosition.y - symmetricPoint.y;

  let resultWidth = Math.round(newWidth);
  let resultHeight = Math.round(newHeight);
  let resultLeft = Math.round(symmetricPoint.x);
  let resultTop = Math.round(symmetricPoint.y);
  if (
    mousePosition.x - symmetricPoint.x >
    canvasClientRect.width - resultLeft
  ) {
    resultWidth = canvasClientRect.width - resultLeft;
  }
  if (resultHeight > canvasClientRect.height - resultTop) {
    resultHeight = canvasClientRect.height - resultTop;
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = componentStyle.left || 0;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = componentStyle.top || 0;
  }

  let isChangeComponentStyle: any = true;
  if (editorMode == "sandbox") {
    isChangeComponentStyle = adjustComponentPosition(
      componentStyle,
      currentCanvasData,
      targetComponentId,
      "rightBottom",
      {
        resultHeight: resultHeight,
        originalCanvasData: originalCanvasData,
        resultTop: resultTop,
      }
    );
    if (isChangeComponentStyle?.resultTop) {
      resultTop = isChangeComponentStyle.resultTop;
    }
    if (isChangeComponentStyle?.resultHeight) {
      resultHeight = isChangeComponentStyle.resultHeight;
    }
  }

  if (resultWidth > 0 && resultHeight > 0 && isChangeComponentStyle) {
    componentStyle.width = resultWidth;
    componentStyle.height = resultHeight;
    componentStyle.left = resultLeft;
    componentStyle.top = resultTop;
  }
}

/**
 * 计算左下角调整（已完成）
 */
function calculateLeftBottom(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint } = resizePointInfo;

  const newWidth = symmetricPoint.x - mousePosition.x;
  const newHeight = mousePosition.y - symmetricPoint.y;

  let resultWidth = Math.round(newWidth);
  let resultHeight = Math.round(newHeight);
  let resultLeft = Math.round(symmetricPoint.x - newWidth);
  let resultTop = Math.round(symmetricPoint.y);
  if (resultLeft < 0) {
    resultLeft = 0;
    resultWidth = symmetricPoint.x - resultLeft;
  }
  if (resultHeight > canvasClientRect.height - resultTop) {
    resultHeight = canvasClientRect.height - resultTop;
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = componentStyle.left || 0;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = componentStyle.top || 0;
  }
  let isChangeComponentStyle: any = true;
  if (editorMode == "sandbox") {
    isChangeComponentStyle = adjustComponentPosition(
      componentStyle,
      currentCanvasData,
      targetComponentId,
      "leftBottom",
      {
        resultHeight: resultHeight,
        originalCanvasData: originalCanvasData,
        resultTop: resultTop,
      }
    );
    if (isChangeComponentStyle?.resultTop) {
      resultTop = isChangeComponentStyle.resultTop;
    }
    if (isChangeComponentStyle?.resultHeight) {
      resultHeight = isChangeComponentStyle.resultHeight;
    }
  }
  if (resultWidth > 0 && resultHeight > 0 && isChangeComponentStyle) {
    componentStyle.width = resultWidth;
    componentStyle.height = resultHeight;
    componentStyle.left = resultLeft;
    componentStyle.top = resultTop;
  }
}

/**
 * 计算上边调整(未完成)
 */
function calculateTop(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint, center } = resizePointInfo;

  // 计算新高度
  const newHeight = symmetricPoint.y - mousePosition.y;
  const width = componentStyle.width || 0;

  let resultHeight = Math.round(newHeight);
  let resultTop = Math.round(mousePosition.y);
  let resultLeft = Math.round(center.x - width / 2);

  const bottomSpace = canvasClientRect.height - resultTop - resultHeight;
  if (resultHeight > canvasClientRect.height - bottomSpace) {
    resultTop = 0;
    resultHeight = canvasClientRect.height - bottomSpace;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = componentStyle.top || 0;
  }
  let isChangeComponentStyle: any = true;
  if (editorMode == "sandbox") {
    isChangeComponentStyle = adjustComponentPosition(
      componentStyle,
      currentCanvasData,
      targetComponentId,
      "top",
      {
        resultTop: resultTop,
        originalCanvasData: originalCanvasData,
      }
    );
  }
  if (resultHeight > 0 && isChangeComponentStyle) {
    componentStyle.height = resultHeight;
    componentStyle.top = resultTop;
    componentStyle.left = resultLeft;
  }
}

/**
 * 计算右边调整(已完成)
 */
function calculateRight(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint, center } = resizePointInfo;
  const originStyle = clone(componentStyle);
  // 计算新宽度
  const newWidth = mousePosition.x - symmetricPoint.x;
  const height = componentStyle.height || 0;

  let resultWidth = Math.round(newWidth);
  let resultLeft = ref(Math.round(symmetricPoint.x));
  let resultTop = Math.round(center.y - height / 2);

  let isPass: any = true;

  if (editorMode == "sandbox") {
    isPass = adjustCanvasWidth(componentStyle, currentCanvasData, {
      originStyle,
      newLeft: Math.round(symmetricPoint.x),
      newWidth: resultWidth,
      originalCanvasData: originalCanvasData,
      componentId: targetComponentId,
    });
  }

  if (
    editorMode == "dash" &&
    resultWidth > canvasClientRect.width - resultLeft.value
  ) {
    resultWidth = canvasClientRect.width - resultLeft.value;
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft.value = componentStyle.left || 0;
  }

  if (resultWidth > 0) {
    if (editorMode == "sandbox") {
      if (isPass && isPass.hasOwnProperty("width")) {
        componentStyle.width = isPass.width;
      } else {
        componentStyle.width = resultWidth;
      }
    } else {
      componentStyle.width = originStyle.width;
    }
    componentStyle.left = resultLeft.value;
    componentStyle.top = resultTop;
  }
}

/**
 * 计算下边调整(已完成)
 */
function calculateBottom(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint, center } = resizePointInfo;

  // 计算新高度
  const newHeight = mousePosition.y - symmetricPoint.y;
  const width = componentStyle.width || 0;

  let resultHeight = Math.round(newHeight);
  let resultTop = Math.round(symmetricPoint.y);
  let resultLeft = Math.round(center.x - width / 2);
  if (resultHeight > canvasClientRect.height - resultTop) {
    resultHeight = canvasClientRect.height - resultTop;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = componentStyle.top || 0;
  }

  let isChangeComponentStyle: any = true;
  if (editorMode == "sandbox") {
    isChangeComponentStyle = adjustComponentPosition(
      componentStyle,
      currentCanvasData,
      targetComponentId,
      "bottom",
      {
        resultHeight: resultHeight,
        originalCanvasData: originalCanvasData,
        resultTop: resultTop,
      }
    );
    if (isChangeComponentStyle?.resultTop) {
      resultTop = isChangeComponentStyle.resultTop;
    }
    if (isChangeComponentStyle?.resultHeight) {
      resultHeight = isChangeComponentStyle.resultHeight;
    }
  }

  if (resultHeight > 0 && isChangeComponentStyle) {
    componentStyle.height = resultHeight;
    componentStyle.top = resultTop;
    componentStyle.left = resultLeft;
  }
}

/**
 * 计算左边调整(已完成)
 */
function calculateLeft(
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  canvasClientRect: any,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const { symmetricPoint, center } = resizePointInfo;

  const originStyle = clone(componentStyle);

  // 计算新宽度
  const newWidth = symmetricPoint.x - mousePosition.x;
  const height = componentStyle.height || 0;

  let resultWidth = Math.round(newWidth);
  let resultLeft = Math.round(mousePosition.x);
  let resultTop = Math.round(center.y - height / 2);

  const originComponent = originalCanvasData.components.find(
    (item) => item.id === targetComponentId
  );
  const leftSpace = resultLeft < 0 ? 0 : resultLeft;
  const rightSpace =
    Math.round(originalCanvasData.width) -
    (Math.round(originComponent.style.left) || 0) -
    (Math.round(originComponent.style.width) || 0);

  let isPass: any = true;

  if (editorMode == "sandbox") {
    isPass = adjustCanvasWidth(componentStyle, currentCanvasData, {
      originStyle,
      newLeft: Math.round(mousePosition.x),
      originalCanvasData: originalCanvasData,
      componentId: targetComponentId,
      componentRightSpace: rightSpace,
    });
  } else {
    if (resultWidth > canvasClientRect.width - leftSpace - rightSpace) {
      resultWidth = canvasClientRect.width - leftSpace - rightSpace;
      resultLeft = 0;
    }
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = componentStyle.left || 0;
  }

  if (resultWidth > 0 && isPass) {
    if (editorMode == "sandbox") {
      const diffWidth =
        originalCanvasData.width -
        (isPass.canvasMinWidth || currentCanvasData.minWidth);
      const isMinWidth = resultWidth <= 50;
      if (isMinWidth) {
        console.log("resultLeft", resultLeft);

        componentStyle.left =
          currentCanvasData.width - resultWidth - rightSpace;
      } else if (isPass.hasOwnProperty("left")) {
        componentStyle.left = isPass.left;
      } else {
        componentStyle.left = resultLeft - diffWidth;
      }
      if (isPass.hasOwnProperty("width")) {
        componentStyle.width = isPass.width;
      } else {
        componentStyle.width = resultWidth;
      }
    } else {
      componentStyle.left = resultLeft;
      componentStyle.width = resultWidth;
    }
    componentStyle.top = resultTop;
  }
}

type EditorMode = "sandbox" | "dash";
/**
 * 通过拖拽调整点来处理组件的尺寸调整和位置更新（不包含旋转和比例锁定逻辑）
 * @param canvasClientRect 画布客户端矩形区域
 * @param resizePoint 调整点位置
 * @param componentStyle 组件样式对象
 * @param mousePosition 当前鼠标位置
 * @param resizePointInfo 调整点信息
 * @param editorMode 编辑器模式
 * @param currentCanvasData 当前画布数据
 * @param originalCanvasData 原始画布数据
 * @param targetComponentId 目标组件ID
 */
export default function handleComponentResizeByPoint(
  canvasClientRect: any,
  resizePoint: ResizePointPosition,
  componentStyle: CanvasComponentStyle,
  mousePosition: Point,
  resizePointInfo: PointInfo,
  editorMode: string,
  currentCanvasData: any,
  originalCanvasData: any,
  targetComponentId: string
) {
  const calcFunction = calcFunctions[resizePoint];
  if (calcFunction) {
    calcFunction(
      componentStyle,
      mousePosition,
      resizePointInfo,
      canvasClientRect,
      editorMode,
      currentCanvasData,
      originalCanvasData,
      targetComponentId
    );
  }
}

/**
 * 简化版本的等比例组件位置和大小计算
 * @param point 调整点位置
 * @param style 组件样式对象
 * @param symmetricPoint 对称点坐标
 */
export function calculateSimpleRadioComponentPositionAndSize(
  point: ResizePointPosition,
  style: CanvasComponentStyle,
  symmetricPoint: Point
) {
  const width = style.width || 0;
  const height = style.height || 0;

  switch (point) {
    case "b":
      style.left = Math.round(symmetricPoint.x - width / 2);
      style.top = symmetricPoint.y;
      break;
    case "t":
      style.left = Math.round(symmetricPoint.x - width / 2);
      style.top = symmetricPoint.y - height;
      break;
    case "l":
      style.left = symmetricPoint.x - width;
      style.top = Math.round(symmetricPoint.y - height / 2);
      break;
    case "r":
      style.left = symmetricPoint.x;
      style.top = Math.round(symmetricPoint.y - height / 2);
      break;
    case "lt":
      style.left = symmetricPoint.x - width;
      style.top = symmetricPoint.y - height;
      break;
    case "lb":
      style.left = symmetricPoint.x - width;
      style.top = symmetricPoint.y;
      break;
    case "rt":
      style.left = symmetricPoint.x;
      style.top = symmetricPoint.y - height;
      break;
    case "rb":
      style.left = symmetricPoint.x;
      style.top = symmetricPoint.y;
      break;
  }
}
