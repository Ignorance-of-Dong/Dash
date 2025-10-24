/**
 * @Author: zhangzheng
 * @Date: 2025-10-14 18:30:00
 * @Description: 画布相关类型定义
 */

/** 画布样式数据接口 */
export interface CanvasStyleData {
  /** 画布宽度 */
  width: number | string;
  /** 画布高度 */
  height: number | string;
  /** 缩放比例 */
  scale: number;
  /** 背景颜色 */
  backgroundColor?: string | null;
  /** 背景图片 */
  backgroundImage?: string;
  /** 其他样式属性 */
  [key: string]: any;
}

/** 画布组件样式接口 */
export interface CanvasComponentStyle {
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** X坐标 */
  left?: number;
  /** Y坐标 */
  top?: number;
  /** 旋转角度 */
  rotate?: number;
  /** 透明度 */
  opacity?: number;
  /** 其他样式属性 */
  [key: string]: any;
}

/** 组件数据接口 */
export interface ComponentData {
  /** 组件唯一ID */
  id: string;
  /** 组件名称 */
  component: string;
  /** 组件样式 */
  style: CanvasComponentStyle;
  /** 是否锁定 */
  isLock?: boolean;
  /** 是否正在编辑 */
  editing?: boolean;
  /** 是否正在调整大小 */
  resizing?: boolean;
  /** 是否正在拖拽 */
  dragging?: boolean;
  /** 其他属性 */
  [key: string]: any;
}

/** 编辑器画布核心组件Props接口 */
export interface EditorCanvasCoreProps {
  /** 画布ID */
  canvasId: string;
  /** 画布样式数据 */
  canvasStyleData: CanvasStyleData;
  componentData: ComponentData[];
}

/** 编辑模式类型 */
export type EditMode = "edit" | "preview";

/** 调整点位置类型 */
export type ResizePointPosition =
  | "lt"
  | "t"
  | "rt"
  | "r"
  | "rb"
  | "b"
  | "lb"
  | "l";

/** 鼠标光标样式类型 */
export type CursorStyle =
  | "nw-resize" // 左上角
  | "n-resize" // 上边
  | "ne-resize" // 右上角
  | "e-resize" // 右边
  | "se-resize" // 右下角
  | "s-resize" // 下边
  | "sw-resize" // 左下角
  | "w-resize" // 左边
  | "move" // 移动
  | "default" // 默认
  | "not-allowed"; // 禁止

/** 调整点样式接口 */
export interface ResizePointStyle extends Record<string, any> {
  marginLeft: string;
  marginTop: string;
  left: string;
  top: string;
  cursor: CursorStyle;
}

/** 画布常量 */
export const CANVAS_CONSTANTS = {
  /** 默认画布ID */
  DEFAULT_CANVAS_ID: "canvas-main",
  /** 编辑器DOM ID前缀 */
  EDITOR_DOM_PREFIX: "editor-",
  /** 组件DOM ID前缀 */
  COMPONENT_DOM_PREFIX: "component",
  /** 调整点列表 */
  RESIZE_POINTS: ["lt", "t", "rt", "r", "rb", "b", "lb", "l"] as const,
} as const;
