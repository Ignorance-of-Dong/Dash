import { componentList } from "./../cursorComponent/config";
/**
 * @Author: zhangzheng
 * @Date: 2025-10-15 18:40:00
 * @Description: 简化版本的组件调整大小计算函数（不包含旋转逻辑）
 */

import { ref } from "vue";
import type { ResizePointPosition, CanvasComponentStyle } from "../types";
import { adjustCanvasWidth } from "./correction";
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
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo
) {
  const { symmetricPoint } = pointInfo;

  // 直接计算新的宽高（不考虑旋转）
  const newWidth = symmetricPoint.x - curPosition.x;
  const newHeight = symmetricPoint.y - curPosition.y;

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
    resultLeft = style.left || 0;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = style.top || 0;
  }

  // 确保宽高为正数
  if (resultWidth > 0 && resultHeight > 0) {
    style.width = resultWidth;
    style.height = resultHeight;
    style.left = resultLeft;
    style.top = resultTop;
  }
}

/**
 * 计算右上角调整 (完成)
 */
function calculateRightTop(
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  canvasClient
) {
  const { symmetricPoint } = pointInfo;

  const newWidth = curPosition.x - symmetricPoint.x;
  const newHeight = symmetricPoint.y - curPosition.y;

  let resultWidth = Math.round(newWidth);
  let resultHeight = Math.round(newHeight);
  let resultLeft = Math.round(symmetricPoint.x);
  let resultTop = Math.round(symmetricPoint.y - newHeight);

  const topSpace = resultTop < 0 ? 0 : resultTop;
  // 正确
  if (curPosition.x - symmetricPoint.x > canvasClient.width - resultLeft) {
    resultWidth = canvasClient.width - resultLeft;
  }

  const bottomSpace = canvasClient.height - resultTop - resultHeight;

  if (
    symmetricPoint.y - curPosition.y >
    canvasClient.height - bottomSpace - topSpace
  ) {
    resultTop = 0;
    resultHeight = canvasClient.height - bottomSpace - topSpace;
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = style.left || 0;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = style.top || 0;
  }

  if (resultWidth > 0 && resultHeight > 0) {
    style.width = resultWidth;
    style.height = resultHeight;
    style.left = resultLeft;
    style.top = resultTop;
  }
}

/**
 * 计算右下角调整 (已完成)
 */
function calculateRightBottom(
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  canvasClient
) {
  const { symmetricPoint } = pointInfo;

  const newWidth = curPosition.x - symmetricPoint.x;
  const newHeight = curPosition.y - symmetricPoint.y;

  let resultWidth = Math.round(newWidth);
  let resultHeight = Math.round(newHeight);
  let resultLeft = Math.round(symmetricPoint.x);
  let resultTop = Math.round(symmetricPoint.y);
  if (curPosition.x - symmetricPoint.x > canvasClient.width - resultLeft) {
    resultWidth = canvasClient.width - resultLeft;
  }
  if (resultHeight > canvasClient.height - resultTop) {
    resultHeight = canvasClient.height - resultTop;
  }

  if (resultWidth > 0 && resultHeight > 0) {
    style.width = resultWidth;
    style.height = resultHeight;
    style.left = resultLeft;
    style.top = resultTop;
  }
}

/**
 * 计算左下角调整（已完成）
 */
function calculateLeftBottom(
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  canvasClient
) {
  const { symmetricPoint } = pointInfo;

  const newWidth = symmetricPoint.x - curPosition.x;
  const newHeight = curPosition.y - symmetricPoint.y;

  let resultWidth = Math.round(newWidth);
  let resultHeight = Math.round(newHeight);
  let resultLeft = Math.round(symmetricPoint.x - newWidth);
  let resultTop = Math.round(symmetricPoint.y);
  if (resultLeft < 0) {
    resultLeft = 0;
    resultWidth = symmetricPoint.x - resultLeft;
  }
  if (resultHeight > canvasClient.height - resultTop) {
    resultHeight = canvasClient.height - resultTop;
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = style.left || 0;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = style.top || 0;
  }

  if (resultWidth > 0 && resultHeight > 0) {
    style.width = resultWidth;
    style.height = resultHeight;
    style.left = resultLeft;
    style.top = resultTop;
  }
}

/**
 * 计算上边调整(已完成)
 */
function calculateTop(
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  canvasClient
) {
  const { symmetricPoint, center } = pointInfo;

  // 计算新高度
  const newHeight = symmetricPoint.y - curPosition.y;
  const width = style.width || 0;

  let resultHeight = Math.round(newHeight);
  let resultTop = Math.round(curPosition.y);
  let resultLeft = Math.round(center.x - width / 2);

  const bottomSpace = canvasClient.height - resultTop - resultHeight;
  if (resultHeight > canvasClient.height - bottomSpace) {
    resultTop = 0;
    resultHeight = canvasClient.height - bottomSpace;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = style.top || 0;
  }
  if (resultHeight > 0) {
    style.height = resultHeight;
    style.top = resultTop;
    style.left = resultLeft;
  }
}

/**
 * 计算右边调整(已完成)
 */
function calculateRight(
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  canvasClient,
  mode,
  canvasData
) {
  const { symmetricPoint, center } = pointInfo;

  // 计算新宽度
  const newWidth = curPosition.x - symmetricPoint.x;
  const height = style.height || 0;

  let resultWidth = Math.round(newWidth);
  let resultLeft = ref(Math.round(symmetricPoint.x));
  let resultTop = Math.round(center.y - height / 2);

  if (mode == "dash" && resultWidth > canvasClient.width - resultLeft.value) {
    resultWidth = canvasClient.width - resultLeft.value;
  }

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft.value = style.left || 0;
  }

  if (resultWidth > 0) {
    style.width = resultWidth;
    style.left = resultLeft.value;
    style.top = resultTop;
  }
  adjustCanvasWidth(style, canvasData);
}

/**
 * 计算下边调整(已完成)
 */
function calculateBottom(
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  canvasClient
) {
  const { symmetricPoint, center } = pointInfo;

  // 计算新高度
  const newHeight = curPosition.y - symmetricPoint.y;
  const width = style.width || 0;

  let resultHeight = Math.round(newHeight);
  let resultTop = Math.round(symmetricPoint.y);
  let resultLeft = Math.round(center.x - width / 2);
  if (resultHeight > canvasClient.height - resultTop) {
    resultHeight = canvasClient.height - resultTop;
  }
  if (resultHeight < 50) {
    resultHeight = 50;
    resultTop = style.top || 0;
  }

  if (resultHeight > 0) {
    style.height = resultHeight;
    style.top = resultTop;
    style.left = resultLeft;
  }
}

/**
 * 计算左边调整(已完成)
 */
function calculateLeft(
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  canvasClient,
  mode,
  canvasData,
  originCanvas,
  componentId
) {
  const { symmetricPoint, center } = pointInfo;

  const originStyle = clone(style);

  // 计算新宽度
  const newWidth = symmetricPoint.x - curPosition.x;
  const height = style.height || 0;

  let resultWidth = Math.round(newWidth);
  let resultLeft = Math.round(curPosition.x);
  let resultTop = Math.round(center.y - height / 2);

  const originComponent = originCanvas.components.find(
    (item) => item.id === componentId
  );
  const leftSpace = resultLeft < 0 ? 0 : resultLeft;
  const rightSpace =
    Math.round(originCanvas.width) -
    (Math.round(originComponent.style.left) || 0) -
    (Math.round(originComponent.style.width) || 0);
  console.log("rightSpace", rightSpace);

  let isPass: any = true;

  if (mode == "sandbox") {
    isPass = adjustCanvasWidth(style, canvasData, {
      originStyle,
      newWidth: symmetricPoint.x - curPosition.x,
      newLeft: Math.round(curPosition.x),
      originCanvas,
      componentId,
      boundaryWidth: canvasClient.width - leftSpace - rightSpace,
      componentRightSpace: rightSpace,
    });
  } else {
    if (resultWidth > canvasClient.width - leftSpace - rightSpace) {
      resultWidth = canvasClient.width - leftSpace - rightSpace;
      resultLeft = 0;
    }
  }
  console.log("resultLeft", resultLeft);

  console.log(resultWidth, canvasClient.width, leftSpace, rightSpace);

  if (resultWidth < 50) {
    resultWidth = 50;
    resultLeft = style.left || 0;
  }

  if (resultWidth > 0 && isPass) {
    if (mode == "sandbox") {
      const diffWidth =
        originCanvas.width - (isPass.canvasMinWidth || canvasData.minWidth);
      const isMinWidth = resultWidth <= 50;
      if (isMinWidth) {
        console.log("resultLeft", resultLeft);

        style.left = canvasData.width - resultWidth - rightSpace;
      } else if (isPass.hasOwnProperty("left")) {
        style.left = isPass.left;
      } else {
        style.left = resultLeft - diffWidth;
      }
      if (isPass.hasOwnProperty("width")) {
        style.width = isPass.width;
      } else {
        style.width = resultWidth;
      }
    } else {
      style.left = resultLeft;
      style.width = resultWidth;
    }

    style.top = resultTop;
  }
}

type EditorMode = "sandbox" | "dash";
/**
 * 简化版本的组件位置和大小计算函数（不包含旋转和比例锁定逻辑）
 * @param point 调整点位置
 * @param style 组件样式对象
 * @param curPosition 当前鼠标位置
 * @param pointInfo 调整点信息
 */
export default function calculateSimpleComponentPositionAndSize(
  canvasClient,
  point: ResizePointPosition,
  style: CanvasComponentStyle,
  curPosition: Point,
  pointInfo: PointInfo,
  mode: string,
  canvasData: any,
  originCanvas: any,
  componentId: string
) {
  const calcFunction = calcFunctions[point];
  if (calcFunction) {
    calcFunction(
      style,
      curPosition,
      pointInfo,
      canvasClient,
      mode,
      canvasData,
      originCanvas,
      componentId
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
