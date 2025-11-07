/*
 * @Author: zhangzheng
 * @Date: 2025-09-30 15:39:31
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-14 16:56:07
 * @Description:
 */

import { divide, multiply } from "mathjs";
import { clone } from "ramda";
import { storeToRefs } from "pinia";
import { useEditorDataStore } from "../store/editorData";

const needToChangeDirectionAttrs = {
  width: ["left", "width", "fontSize", "activeFontSize", "letterSpacing"],
  height: ["top", "height"],
};

export const changeComponentsSizeWithScaleUtil = () => {
  const editorDataStore = useEditorDataStore();
  const { componentData, curComponentIndex, canvasStyleData } =
    storeToRefs(editorDataStore);
  function changeSizeWithScaleAdaptor(scale) {
    return changeComponentsSizeWithScale(scale);
  }

  function changeSizeWithScale(scale) {
    return changeComponentsSizeWithScale(scale);
  }
  function format(value, scale) {
    return multiply(value, divide(parseFloat(scale), 100));
  }
  function getOriginStyle(value = 0, scale) {
    if (!value) {
      value = 0;
    }
    return divide(value, divide(parseFloat(scale), 100));
  }

  function changeComponentsSizeWithScaleCircle(componentDataCopy, scale) {
    if (!componentDataCopy || !Array.isArray(componentDataCopy)) {
      return;
    }
    componentDataCopy?.forEach((component) => {
      Object.keys(component.style).forEach((key) => {
        if (needToChangeDirectionAttrs.width.includes(key)) {
          // 根据原来的比例获取样式原来的尺寸
          // 再用原来的尺寸 * 现在的比例得出新的尺寸
          if (!!component.style[key]) {
            component.style[key] = format(
              getOriginStyle(component.style[key], canvasStyleData.value.scale),
              scale
            );
          }
        } else if (needToChangeDirectionAttrs.height.includes(key)) {
          // 根据原来的比例获取样式原来的尺寸
          // 再用原来的尺寸 * 现在的比例得出新的尺寸
          component.style[key] = format(
            getOriginStyle(
              component.style[key],
              canvasStyleData.value.scaleHeight
            ),
            scale
          );
        }
      });

      // if (["Group"].includes(component.component)) {
      //   groupSizeStyleAdaptor(component);
      //   const parentStyle = component.style;
      //   component.propValue.forEach((componentInner) => {
      //     if (["DeTabs"].includes(componentInner.component)) {
      //       componentInner.propValue.forEach((tabItem) => {
      //         changeComponentsSizeWithScaleCircle(tabItem.componentData, scale);
      //       });
      //     } else {
      //       changeComponentsSizeWithScaleCircle(componentInner.propValue, scale);
      //       groupItemStyleAdaptor(componentInner, parentStyle);
      //     }
      //   });
      // } else if (["DeTabs"].includes(component.component)) {
      //   component.propValue.forEach((tabItem) => {
      //     changeComponentsSizeWithScaleCircle(tabItem.componentData, scale);
      //   });
      // }
      // // 如果是分组组件 则要进行分组内部组件groupStyle进行深度计算
      // // 计算逻辑 Group 中样式 * groupComponent.groupStyle[sonKey].
      // if (["Group", "DeTabs"].includes(component.component)) {
      //   try {
      //     nextTick(() => groupSizeStyleAdaptor(component));
      //   } catch (e) {
      //     // 旧Group适配
      //     console.error("group adaptor error:" + e);
      //   }
      // }
    });
  }
  function changeComponentsSizeWithScale(scale) {
    const componentDataCopy = clone(componentData.value);
    changeComponentsSizeWithScaleCircle(componentDataCopy, scale);
    editorDataStore.setComponentData(componentDataCopy);
    // 更新画布数组后，需要重新设置当前组件，否则在改变比例后，直接拖动圆点改变组件大小不会生效
    editorDataStore.setCurComponent({
      component: componentData.value[curComponentIndex.value as any],
      index: curComponentIndex.value,
    });

    // 分开保存初始化宽高比例
    editorDataStore.setCanvasStyle({
      ...canvasStyleData.value,
      scaleWidth: scale,
      scaleHeight: scale,
      scale,
    });
  }

  return {
    changeSizeWithScale,
    changeSizeWithScaleAdaptor,
    changeComponentsSizeWithScale,
    format,
    getOriginStyle,
    changeComponentsSizeWithScaleCircle,
  };
};

const needToChangeAttrs2 = ["width", "height", "fontSize"];
export function changeComponentSizeWithScale(component, scale) {
  Object.keys(component.style).forEach((key) => {
    if (needToChangeAttrs2.includes(key)) {
      if (key === "fontSize" && component.style[key] === "") return;
      component.style[key] = format(component.style[key], scale);
    }
  });
}
function format(value, scale) {
  return multiply(value, divide(parseFloat(scale), 100));
}
