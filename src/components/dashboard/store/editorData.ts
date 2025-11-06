/*
 * @Author: zhangzheng
 * @Date: 2025-09-25 19:12:54
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-11-06 15:01:51
 * @Description:
 */
import { defineStore } from "pinia";
import { clone } from "ramda";
import { SENIOR_STYLE_SETTING_LIGHT } from "../config/chart";
export const useEditorDataStore = defineStore("editorData", {
  state: () => {
    return {
      canvasStyleData: {
        width: 1920,
        height: 1080,
        scale: 60,
        scaleWidth: 60,
        scaleHeight: 60,
        backgroundColorSelect: true,
        backgroundImageEnable: false,
        background: "",
        fontSize: 14,
        fontFamily: "PingFang",
        color: "#fff",
        backgroundColor: null,
        component: {} as any,
      },
      editMode: "edit", // 编辑器模式 edit preview
      componentData: [] as any, // 画布组件数据
      curComponent: null as any,
      scale: 1,
      mode: "sandbox", // sandbox editor
      dragStatus: "idle", // idle dragIn dragOut
      dragCanvasId: "",
      curComponentIndex: null,
      editorMap: {},
      isSpaceDown: false,
      sandboxCanvasStyle: {
        width: 1920,
        height: 1080,
        scale: 1,
        widthScale: 1,
        heightScale: 1,
      },
      sandboxCanvasStatus: "idle", // idle 空闲 update 更新
      sandboxCanvasSnapshot: [], // 快照
      sandboxCanvasSnapshotIndex: -1, // 快照索引
      sandboxCanvas: {
        left: {
          id: "left",
          width: 400,
          minWidth: 400,
          height: 1080,
          heightType: "auto",
          top: 0,
          left: 0,
          layout: "vertical",
          components: [] as any,
          componentGap: 10,
          borderRadius: 10,
          squeezing: ["leftTop"], // 将要挤压的画布
          obstacle: ["bottom", "right"], // 障碍物
          expansionDirection: "right",
          floatPosition: "left",
        },
        leftTop: {
          id: "leftTop",
          width: 400,
          minWidth: 400,
          height: 100,
          top: 0,
          left: 400,
          components: [] as any,
          isPositionLeftScale: true,
          layout: "horizontal",
          componentGap: 10,
          borderRadius: 10,
          squeezing: ["left"], // 允许 left 画布挤压 leftTop
          obstacle: ["right"],
          expansionDirection: "right",
          floatPosition: "leftTop",
        },
        right: {
          id: "right",
          width: 400,
          minWidth: 400,
          height: 1080,
          heightType: "auto",
          top: 0,
          left: 0,
          components: [] as any,
          componentGap: 10,
          layout: "vertical",
          borderRadius: 10,
          squeezing: [], // 允许所有画布挤压
          obstacle: ["leftTop"],
          expansionDirection: "left",
          floatPosition: "right",
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
    recordSandboxSnapshot() {
      if (this.mode === "sandbox") {
        const newSnapshot = clone(this.sandboxCanvas);
        this.sandboxCanvasSnapshot[++this.sandboxCanvasSnapshotIndex] =
          newSnapshot;
        if (
          this.sandboxCanvasSnapshotIndex <
          this.sandboxCanvasSnapshot.length - 1
        ) {
          this.sandboxCanvasSnapshot = this.sandboxCanvasSnapshot.slice(
            0,
            this.sandboxCanvasSnapshotIndex + 1
          );
        }
      }
    },

    undoSandboxSnapshot() {
      if (this.sandboxCanvasSnapshotIndex > 0) {
        this.sandboxCanvasSnapshotIndex--;
        this.sandboxCanvas =
          this.sandboxCanvasSnapshot[this.sandboxCanvasSnapshotIndex];
      }
    },

    redoSandboxSnapshot() {
      if (
        this.sandboxCanvasSnapshotIndex <
        this.sandboxCanvasSnapshot.length - 1
      ) {
        this.sandboxCanvasSnapshotIndex++;
        this.sandboxCanvas =
          this.sandboxCanvasSnapshot[this.sandboxCanvasSnapshotIndex];
      }
    },
    setSandboxCanvasStatus(status) {
      this.sandboxCanvasStatus = status;
    },
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
      this.editorMap[canvasId] = document.querySelector("#editor-" + canvasId);
    },
    setContainerScale(value) {
      this.sandboxCanvasStyle.scale = value;
    },
    setContainerHeightScale(value) {
      this.sandboxCanvasStyle.heightScale = value;
    },
    setContainerWidthScale(value) {
      this.sandboxCanvasStyle.widthScale = value;
    },
    setComponentData(componentData = []) {
      this.componentData = componentData;
    },
    setCurComponent({ component, index }) {
      this.curComponent = component;
      this.curComponentIndex = index;
    },
    setCanvasStyle(style) {
      style.component["seniorStyleSetting"] =
        style.component["seniorStyleSetting"] ||
        clone(SENIOR_STYLE_SETTING_LIGHT);
      this.canvasStyleData = style;
    },
    addComponent({ component, index, componentData = this.componentData }) {
      if (index !== undefined) {
        componentData.splice(index, 0, component);
        this.setCurComponent({ component: component, index: index });
      } else {
        componentData.push(component);
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
