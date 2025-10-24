/**
 * @Author: zhangzheng
 * @Date: 2025-10-14 16:16:06
 * @Description: 仪表板类型定义统一导出
 */

// 编辑器相关类型
export type { DragState, EditorState, ScrollEvent } from "./editor";

export { EDITOR_CONSTANTS } from "./editor";

// 标尺相关类型
export type {
  RulerDirection,
  TickMark,
  RulerProps,
  ComponentStyle,
} from "./ruler";

export { RULER_CONSTANTS } from "./ruler";

// 画布相关类型
export type {
  CanvasStyleData,
  ComponentData,
  CanvasComponentStyle,
  EditorCanvasCoreProps,
  EditMode,
  ResizePointPosition,
  CursorStyle,
  ResizePointStyle,
} from "./canvas";

export { CANVAS_CONSTANTS } from "./canvas";
