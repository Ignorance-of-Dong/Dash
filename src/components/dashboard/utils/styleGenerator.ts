import { SANDBOX_EDITOR_DEFAULT_COLOR } from "../config";
import { useEditorDataStore } from "../store/editorData";
import { toPercent } from "./mathUtils";

/*
 * @Author: zhangzheng
 * @Date: 2025-09-29 16:11:16
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-22 16:09:04
 * @Description:
 */
export function getCanvasStyle(canvasStyleData, canvasId = "canvas-main") {
  const {
    backgroundColorSelect,
    background,
    backgroundColor,
    backgroundImageEnable,
    fontSize,
    mobileSetting,
    fontFamily,
  } = canvasStyleData;
  const style = { fontSize: fontSize + "px", color: canvasStyleData.color };
  if (true) {
    // 仪表板默认色#f5f6f7 大屏默认配色 #1a1a1a
    let colorRGBA = "#1a1a1a";
    const editorDataStore = useEditorDataStore();
    const mode = editorDataStore.mode;
    if (mode === "sandbox") {
      colorRGBA = "";
    }
    if (mode === "dashBoard") {
      colorRGBA = colorRGBA;
    }

    if (backgroundColorSelect && backgroundColor) {
      colorRGBA = backgroundColor;
    }
    // if (backgroundImageEnable) {
    //   style["background"] = `url(${imgUrlTrans(
    //     background
    //   )}) no-repeat ${colorRGBA}`;
    // } else {
    style["background-color"] = colorRGBA;
    // }

    // if (dvMainStore.mobileInPc && mobileSetting?.customSetting) {
    //   const {
    //     backgroundColorSelect,
    //     color,
    //     backgroundImageEnable,
    //     background,
    //   } = mobileSetting;
    //   if (
    //     backgroundColorSelect &&
    //     backgroundImageEnable &&
    //     typeof background === "string"
    //   ) {
    //     style["background"] = `url(${imgUrlTrans(
    //       background
    //     )}) no-repeat ${color}`;
    //   } else if (backgroundColorSelect) {
    //     style["background-color"] = color;
    //   } else if (backgroundImageEnable) {
    //     style["background"] = `url(${imgUrlTrans(background)}) no-repeat`;
    //   }
    // }
    style["font-family"] = fontFamily + "!important";
  }

  return style;
}

export function getShapeItemStyle(item) {
  const result = {
    width: item.style.width + "px",
    height: item.style.height + "px",
    left: item.style.left + "px",
    top: item.style.top + "px",
  };
  return result;
}
const needUnit = [
  "fontSize",
  "width",
  "height",
  "top",
  "left",
  "borderWidth",
  "letterSpacing",
  "borderRadius",
];

export function getStyle(style, filter = []) {
  const result = {};
  Object.keys(style).forEach((key: string) => {
    if (!filter.includes(key as never)) {
      if (key != "rotate") {
        if (style[key] !== "") {
          result[key] = style[key];

          if (needUnit.includes(key)) {
            result[key] += "px";
          }
        }
      } else {
        result["transform"] = key + "(" + style[key] + "deg)";
      }
    }
  });
  return result;
}
