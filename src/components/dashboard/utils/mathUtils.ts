/*
 * @Author: zhangzheng
 * @Date: 2025-09-29 16:13:34
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-29 10:52:14
 * @Description:
 */

import { divide, multiply, floor } from "mathjs";

/**
 * 根据缩放比例调整样式数值
 *
 * @description 将原始数值按照指定的缩放比例进行计算，常用于画布缩放、响应式布局等场景
 * @param {number} value - 原始数值（像素值、尺寸等）
 * @param {number} scale - 缩放比例（百分比形式，如 120 表示 120%）
 * @returns {number} 缩放后的整数值
 *
 * @example
 * // 原始宽度100px，缩放比例120%
 * changeStyleWithScale(100, 120) // 返回 120
 *
 * // 原始高度50px，缩放比例80%
 * changeStyleWithScale(50, 80) // 返回 40
 */
export function changeStyleWithScale(value, scale) {
  // 将缩放比例转换为小数形式（如 120% -> 1.2）
  const scaleRatio = divide(parseInt(scale + ""), 100);

  // 计算缩放后的值并向下取整
  return floor(multiply(value, scaleRatio));
}

export function toPercent(val) {
  return val * 100 + "%";
}

// 求两点之间的中点坐标
export function getCenterPoint(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}
// 角度转弧度
// Math.PI = 180 度
function angleToRadian(angle) {
  return (angle * Math.PI) / 180;
}
export function calculateRotatedPointCoordinate(point, center, rotate) {
  /**
   * 旋转公式：
   *  点a(x, y)
   *  旋转中心c(x, y)
   *  旋转后点n(x, y)
   *  旋转角度θ                tan ??
   * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
   * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
   */

  return {
    x:
      (point.x - center.x) * Math.cos(angleToRadian(rotate)) -
      (point.y - center.y) * Math.sin(angleToRadian(rotate)) +
      center.x,
    y:
      (point.x - center.x) * Math.sin(angleToRadian(rotate)) +
      (point.y - center.y) * Math.cos(angleToRadian(rotate)) +
      center.y,
  };
}
