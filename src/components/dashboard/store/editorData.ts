/*
 * @Author: zhangzheng
 * @Date: 2025-09-25 19:12:54
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-24 18:17:19
 * @Description:
 */
import { defineStore } from "pinia";
import { clone } from "ramda";
import { DEFAULT_CANVAS_STYLE_DATA_DARK } from "../config";
import { SENIOR_STYLE_SETTING_LIGHT } from "../config/chart";
export const useEditorDataStore = defineStore("editorData", {
  state: () => {
    return {
      canvasStyleData: {
        ...clone(DEFAULT_CANVAS_STYLE_DATA_DARK),
        backgroundColor: null,
      },
      editMode: "edit", // 编辑器模式 edit preview
      componentData: [] as any, // 画布组件数据
      curComponent: null as any,
      scale: 1,
      mode: "sandbox", // sandbox editor
      dragStatus: "idle", // idle dragIn dragOut
      dragCanvasId: "",
      curComponentIndex: null,
      dataPrepareState: false, //数据准备状态
      dvInfo: {
        dataState: null,
        optType: null,
        id: null,
        name: null,
        pid: null,
        status: null,
        selfWatermarkStatus: null,
        watermarkInfo: {},
        type: null,
        mobileLayout: false,
      },
      editorMap: {},
      isSpaceDown: false,
      sandboxCanvas: {
        left: {
          id: "left",
          width: 400,
          minWidth: 400,
          height: "auto",
          top: 10,
          left: 10,
          layout: "vertical",
          components: [],
          componentGap: 10,
          scale: 100,
          borderRadius: 10,
          squeezing: ["leftTop"], // 可以挤压的画布
          obstacle: ["bottom"], // 目标障碍物
          expansionDirection: "right",
        },
        leftTop: {
          id: "leftTop",
          width: 400,
          minWidth: 400,
          height: 100,
          top: 10,
          left: 420,
          components: [],
          layout: "horizontal",
          componentGap: 10,
          scale: 100,
          borderRadius: 10,
          squeezing: ["left"], // 允许 left 画布挤压 leftTop
          obstacle: ["bottom"],
          expansionDirection: "right",
        },
        right: {
          id: "right",
          width: 400,
          minWidth: 400,
          height: "auto",
          top: 10,
          right: 10,
          components: [],
          componentGap: 10,
          layout: "vertical",
          scale: 100,
          borderRadius: 10,
          squeezing: [], // 允许所有画布挤压
          obstacle: ["bottom", "leftTop"],
          expansionDirection: "left",
        },
        // bottom: {
        //   id: "bottom",
        //   width: 500,
        //   minWidth: 400,
        //   height: 100,
        //   bottom: 10,
        //   left: 1000,
        //   aligin: "center",
        //   components: [],
        //   componentGap: 10,
        //   layout: "horizontal",
        //   scale: 100,
        //   borderRadius: 10,
        //   squeezing: [], // 不允许任何画布挤压（严格保护）
        //   obstacle: ["leftTop"], // 只允许 leftTop 画布覆盖
        //   expansionDirection: "right",
        // },
      },
    };
  },
  actions: {
    addSandboxComponent({ component, canvasId }) {
      this.sandboxCanvas[canvasId].components.push(component);
    },
    setDragStatus(status = "idle", canvasId?) {
      this.dragStatus = status;
      this.dragCanvasId = canvasId || "";
    },
    setSpaceDownStatus(value) {
      this.isSpaceDown = value;
    },
    getEditor(canvasId = "canvas-main") {
      console.log('[ "#editor-" + canvasId ] >', "#editor-" + canvasId);
      console.log(document.querySelector("#editor-" + canvasId));
      this.editorMap[canvasId] = document.querySelector("#editor-" + canvasId);
    },
    setCanvasStyleScale(value) {
      this.canvasStyleData.scale = value;
    },
    setComponentData(componentData = []) {
      this.componentData = componentData;
    },
    setCurTabName(val) {
      this.curTabName = val;
    },
    setHiddenListStatus(status?) {
      if (status != undefined) {
        this.hiddenListStatus = !!status;
      } else {
        this.hiddenListStatus = !this.hiddenListStatus;
      }
      if (this.dvInfo.type === "dashboard") {
        this.setBatchOptStatus(false);
      }
    },
    setCurComponent({ component, index }) {
      console.log("[ setCurComponent ] >", component, index);
      if (!component && this.curComponent) {
        this.curComponent["editing"] = false;
        this.curComponent["resizing"] = false;
        this.curComponent["dragging"] = false;
      }
      this.curComponent = component;
      this.curComponentIndex = index;
    },
    setCanvasStyle(style) {
      style.component["seniorStyleSetting"] =
        style.component["seniorStyleSetting"] ||
        clone(SENIOR_STYLE_SETTING_LIGHT);
      this.canvasStyleData = style;
    },
    addComponent({
      component,
      index,
      isFromGroup = false,
      componentData = this.componentData,
    }) {
      if (index !== undefined) {
        componentData.splice(index, 0, component);
        this.setCurComponent({ component: component, index: index });
      } else {
        componentData.push(component);
        console.log("[ componentData ] >", componentData);
        console.log(component);

        // this.setCurComponent({
        //   component: component,
        //   index: componentData.length - 1,
        // });
      }
    },
    setShapeStyle({ top, left, width, height, rotate, transition }) {
      if (top || top == 0) this.curComponent.style.top = top;
      if (left || left == 0) this.curComponent.style.left = left;
      if (width) this.curComponent.style.width = width;
      if (height) this.curComponent.style.height = height;
      if (rotate) this.curComponent.style.rotate = rotate;
      if (transition) this.curComponent.style.transition = transition;
    },
  },
});
