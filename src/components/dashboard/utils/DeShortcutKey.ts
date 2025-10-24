/*
 * @Author: zhangzheng
 * @Date: 2025-09-29 15:32:59
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-14 16:55:31
 * @Description:
 */
import { storeToRefs } from "pinia";
import { useEditorDataStore } from "../store/editorData";

const ctrlKey = 17,
  shiftKey = 16, // shift
  commandKey = 91, // mac command
  leftKey = 37, // 向左
  upKey = 38, // 向上
  rightKey = 39, // 向右
  downKey = 40, // 向下
  vKey = 86, // 粘贴
  cKey = 67, // 复制
  xKey = 88, // 剪切
  yKey = 89, // 重做
  zKey = 90, // 撤销
  gKey = 71, // 组合
  bKey = 66, // 拆分
  lKey = 76, // 锁定
  uKey = 85, // 解锁
  sKey = 83, // 保存
  pKey = 80, // 预览
  dKey = 68, // 删除
  deleteKey = 46, // 删除
  macDeleteKey = 8, // 删除
  eKey = 69, // 清空画布
  spaceKey = 32; // 空格键

export const keycodes = [
  8, 37, 38, 39, 40, 66, 67, 68, 69, 71, 76, 80, 83, 85, 86, 88, 89, 90,
];

// 与组件状态无关的操作
// const basemap = {
//   [vKey]: paste,
//   [yKey]: redo,
//   [zKey]: undo,
//   [sKey]: save,
//   [pKey]: preview,
//   [eKey]: clearCanvas,
// };

// 当处于大屏状态时 按上下左右键 可以移动位置
// const positionMoveKey = {
//   [leftKey]: move,
//   [upKey]: move,
//   [rightKey]: move,
//   [downKey]: move,
// };

// 组件锁定状态下可以执行的操作
// const lockMap = {
//   ...basemap,
//   [uKey]: unlock,
// };

// 组件未锁定状态下可以执行的操作
// const unlockMap = {
//   ...basemap,
//   [cKey]: copy,
//   [xKey]: cut,
//   [gKey]: compose,
//   [bKey]: decompose,
//   [dKey]: deleteComponent,
//   [deleteKey]: deleteComponent,
//   [lKey]: lock,
// };

let isCtrlOrCommandDown = false;
let isShiftDown = false;

export const shortcutKey = () => {
  const editorDataStore = useEditorDataStore();
  const { curComponent, editMode } = storeToRefs(editorDataStore);
  const listenGlobalKeyDown = () => {
    window.onkeydown = (e) => {
      if (editMode.value === "preview") return;
      const { keyCode } = e;
      if (keyCode === spaceKey) {
        editorDataStore.setSpaceDownStatus(true);
        e.preventDefault();
        e.stopPropagation();
      } else if (
        (keyCode == deleteKey || keyCode == macDeleteKey) &&
        curComponent.value
      ) {
        // dvMainStore.deleteComponent();
      }
    };

    window.onkeyup = (e) => {
      if (e.keyCode === spaceKey) {
        editorDataStore.setSpaceDownStatus(false);
        e.preventDefault();
        e.stopPropagation();
      }
    };
  };
  return {
    listenGlobalKeyDown,
  };
};
