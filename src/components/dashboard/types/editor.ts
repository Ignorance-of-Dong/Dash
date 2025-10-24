/**
 * @Author: zhangzheng
 * @Date: 2025-10-14 16:16:06
 * @Description: 仪表板编辑器相关类型定义
 */

/** 拖拽状态接口 */
export interface DragState {
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 拖拽开始时的 X 坐标 */
  startX: number;
  /** 拖拽开始时的 Y 坐标 */
  startY: number;
  /** 拖拽开始时的滚动左侧位置 */
  scrollLeft: number;
  /** 拖拽开始时的滚动顶部位置 */
  scrollTop: number;
}

/** 编辑器状态接口 */
export interface EditorState {
  /** 侧边栏显示状态 */
  sideShow?: boolean;
  /** 计数时间 */
  countTime?: number;
  /** 数据集树 */
  datasetTree?: any[];
  /** 缩放历史 */
  scaleHistory?: number | null;
  /** 画布 ID */
  canvasId: string;
  /** 画布初始化状态 */
  canvasInitStatus?: boolean;
  /** 源 PID */
  sourcePid?: string | null;
  /** 资源 ID */
  resourceId?: string | null;
  /** 操作类型 */
  opt?: string | null;
  /** 基础宽度 */
  baseWidth?: number;
  /** 基础高度 */
  baseHeight?: number;
}

/** 滚动事件接口 */
export interface ScrollEvent {
  scrollLeft: number;
  scrollTop: number;
}

/** 编辑器常量 */
export const EDITOR_CONSTANTS = {
  /** 最小画布宽度 */
  MIN_CANVAS_WIDTH: 1600,
  /** 缩放阈值 */
  SCALE_THRESHOLD: 150,
  /** 滚动偏移系数 */
  SCROLL_OFFSET_SMALL: 1.5,
  SCROLL_OFFSET_LARGE: 2,
  /** 初始滚动 Y 偏移 */
  INITIAL_SCROLL_Y_OFFSET: 20,
} as const;
