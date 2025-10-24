/**
 * @Author: zhangzheng
 * @Date: 2025-10-14 16:57:31
 * @Description: 标尺组件相关类型定义
 */

/** 标尺方向类型 */
export type RulerDirection = "horizontal" | "vertical";

/** 刻度标记接口 */
export interface TickMark {
  /** 刻度位置（像素） */
  position: number;
  /** 刻度标签值 */
  label: number;
  /** 是否为长刻度 */
  isLong: boolean;
}

/** 标尺组件属性接口 */
export interface RulerProps {
  /** 刻度标签格式化函数 */
  tickLabelFormatter?: (value: number) => string;
  /** 标尺尺寸 */
  size?: number;
  /** 标尺方向 */
  direction?: RulerDirection;
}

/** 组件样式接口 */
export interface ComponentStyle {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 标尺常量 */
export const RULER_CONSTANTS = {
  /** 长刻度间隔倍数 */
  LONG_TICK_INTERVAL: 5,
  /** 最小容器宽度 */
  MIN_CONTAINER_WIDTH: 1600,
  /** 标尺高度 */
  RULER_HEIGHT: 30,
  /** Tab 页头部偏移量 */
  TAB_HEADER_OFFSET: 56,
  /** 缩放计算基数 */
  SCALE_BASE_FACTOR: 200000,
  /** 最小刻度间隔 */
  MIN_TICK_INTERVAL: 10,
} as const;
