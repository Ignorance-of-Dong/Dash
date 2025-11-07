import { useEditorDataStore } from "../store/editorData";

/*
 * @Author: zhangzheng
 * @Date: 2025-10-22 17:22:01
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-11-06 18:02:42
 * @Description: 组件位置校正和重叠检测工具函数
 */

// ==================== 常量定义 ====================

/** 重叠检测的敏感区域比例（五分之一到五分之四） */
const OVERLAP_DETECTION_RATIO = {
  START: 1 / 5, // 五分之一
  END: 4 / 5, // 五分之四
} as const;

// ==================== 辅助函数 ====================

/**
 * 检测两个矩形是否重叠
 * @param rect1 第一个矩形 { left, top, width, height }
 * @param rect2 第二个矩形 { left, top, width, height }
 * @returns 是否重叠
 */
const isRectangleOverlap = (
  rect1: { left: number; top: number; width: number; height: number },
  rect2: { left: number; top: number; width: number; height: number }
): boolean => {
  const rect1Right = rect1.left + rect1.width;
  const rect1Bottom = rect1.top + rect1.height;
  const rect2Right = rect2.left + rect2.width;
  const rect2Bottom = rect2.top + rect2.height;

  return (
    rect1.left < rect2Right &&
    rect1Right > rect2.left &&
    rect1.top < rect2Bottom &&
    rect1Bottom > rect2.top
  );
};

/**
 * 检测重叠区域是否与核心区域有交集
 * @param newRect 新组件矩形
 * @param existingRect 现有组件矩形
 * @returns 是否与核心区域重叠
 */
const isCoreAreaOverlap = (
  newRect: { left: number; top: number; width: number; height: number },
  existingRect: { left: number; top: number; width: number; height: number }
): boolean => {
  // 计算现有组件的核心区域
  const coreLeft =
    existingRect.left + existingRect.width * OVERLAP_DETECTION_RATIO.START;
  const coreTop =
    existingRect.top + existingRect.height * OVERLAP_DETECTION_RATIO.START;
  const coreWidth =
    existingRect.width *
    (OVERLAP_DETECTION_RATIO.END - OVERLAP_DETECTION_RATIO.START);
  const coreHeight =
    existingRect.height *
    (OVERLAP_DETECTION_RATIO.END - OVERLAP_DETECTION_RATIO.START);

  const coreRect = {
    left: coreLeft,
    top: coreTop,
    width: coreWidth,
    height: coreHeight,
  };

  return isRectangleOverlap(newRect, coreRect);
};

// ==================== 类型定义 ====================

/** 组件样式接口 */
interface ComponentStyle {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 组件接口 */
interface Component {
  id: string;
  style: ComponentStyle;
}

export const correctionComponentPosition = (
  component: any,
  rectInfo: any,
  canvasData?
) => {
  // 边界判断 - 确保组件不会超出画布边界
  if (component.style.left > rectInfo.width - component.style.width) {
    component.style.left = rectInfo.width - component.style.width;
  }
  if (component.style.top > rectInfo.height - component.style.height) {
    component.style.top = rectInfo.height - component.style.height;
  }
  if (component.style.left < 0) {
    component.style.left = 0;
  }
  if (component.style.top < 0) {
    component.style.top = 0;
  }

  if (component.style.width > rectInfo.width) {
    component.style.width = rectInfo.width;
  }
  if (component.style.height > rectInfo.height) {
    component.style.height = rectInfo.height;
  }

  const componentLength = canvasData?.components.length;

  if (canvasData.layout === "vertical") {
    let totalComponentHeight = canvasData?.components.reduce(
      (acc, component) => acc + component.style.height,
      0
    );

    const totalGapHeight =
      componentLength >= 2
        ? (componentLength - 1) * canvasData?.componentGap
        : 0;

    totalComponentHeight = totalComponentHeight + totalGapHeight;

    //   剩余区域高度 = 画布高度 - 组件高度 - 组件间距高度
    const totalOccupiedAraeHeight =
      rectInfo.height - totalComponentHeight - totalGapHeight;

    if (totalOccupiedAraeHeight <= 0) {
      alert("剩余区域高度不足");
      return false;
    }

    const gap = canvasData?.components.length ? canvasData?.componentGap : 0;
    if (component.style.height > totalOccupiedAraeHeight) {
      component.style.height = totalOccupiedAraeHeight;
      component.style.top = totalComponentHeight + gap;
    } else {
      component.style.top = totalComponentHeight + gap;
    }
    //
    return component;
  }
  if (canvasData.layout === "horizontal") {
    let totalComponentWidth = canvasData?.components.reduce(
      (acc, component) => acc + component.style.width,
      0
    );
    const totalGapWidth =
      componentLength >= 2
        ? (componentLength - 1) * canvasData?.componentGap
        : 0;
    totalComponentWidth = totalComponentWidth + totalGapWidth;
    const totalOccupiedAraeWidth =
      rectInfo.width - totalComponentWidth - totalGapWidth;
    if (totalOccupiedAraeWidth <= 0) {
      alert("剩余区域宽度不足");
      return false;
    }
    const gap = canvasData?.components.length ? canvasData?.componentGap : 0;
    if (component.style.width > totalOccupiedAraeWidth) {
      component.style.width = totalOccupiedAraeWidth;
      component.style.left = totalComponentWidth + gap;
    } else {
      component.style.left = totalComponentWidth + gap;
    }
  }
  return component;
};

// 获取剩余区域的宽高和定位提示
export const getRemainingArae = ({ components, id }, araeContainer) => {
  const totalAraeHeight = araeContainer?.clientHeight || 0;
  const totalAraeWidth = araeContainer?.clientWidth || 0;
  let remainingArae = {
    width: 0,
    height: 0,
  };

  // 获取组件中的最大宽度
  const maxWidth = Math.max(
    ...components.map((component) => component.style.width)
  );

  components.forEach((component) => {
    remainingArae.height += component.style.height;
  });

  return {
    width: totalAraeWidth + "px",
    height: totalAraeHeight - remainingArae.height + "px",
    top: remainingArae.height + "px",
    left: 0 + "px",
  };
};

/**
 * 位置更换检测函数
 * 检测组件移动到新位置时是否与其他组件发生重叠，如果重叠则进行位置交换
 *
 * @param originalStyle 原始样式对象，包含组件的原始位置信息
 * @param newStyle 新样式对象，包含组件要移动到的新位置信息
 * @param canvasData 画布数据，包含所有组件信息
 * @param componentId 当前移动组件的ID，用于排除自身
 * @param layout 布局类型，vertical 垂直布局，horizontal 水平布局
 * @returns 返回处理后的样式对象
 */
export const positionChange = (
  originalStyle: any,
  newStyle: any,
  canvasData: any,
  componentId: string
) => {
  if (canvasData.layout == "vertical") {
    const { top, left } = originalStyle;
    const { top: newTop, left: newLeft } = newStyle;
    let components = canvasData?.components;

    // 过滤掉当前移动的组件，避免与自身比较
    components = components.filter((component) => component.id !== componentId);
    // 查找与新位置重叠的组件
    const exceedComponent = components.find((component) => {
      // 获取新组件的尺寸（从 newStyle 中获取，如果没有则使用原始尺寸）
      const newWidth = newStyle.width || originalStyle.width;
      const newHeight = newStyle.height || originalStyle.height;

      // 构建新组件和现有组件的矩形对象
      const newRect = {
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight,
      };

      const existingRect = {
        left: component.style.left,
        top: component.style.top,
        width: component.style.width,
        height: component.style.height,
      };

      // 首先检查是否有基本重叠
      const hasBasicOverlap = isRectangleOverlap(newRect, existingRect);
      if (hasBasicOverlap) {
        const hasCoreOverlap = isCoreAreaOverlap(newRect, existingRect);
        return hasCoreOverlap;
      }
      return false;
    });

    let resultStyle: any = {};

    if (exceedComponent) {
      // 保存重叠组件的原始位置
      const targetOriginalTop = exceedComponent.style.top;
      const targetOriginalLeft = exceedComponent.style.left;

      // 将当前组件移动到重叠组件的位置
      resultStyle = {
        ...newStyle,
        top: targetOriginalTop,
      };

      // 同时将重叠组件移动到当前组件的原始位置（实现位置交换）
      exceedComponent.style.top = top;
      // exceedComponent.style.left = left;
    } else {
      resultStyle = {
        ...newStyle,
        top: top,
      };
    }

    return {
      ...resultStyle,
      transition: "all 0.2s",
    };
  }
  if (canvasData.layout === "horizontal") {
    //  增加水平布局逻辑，和垂直布局一样的逻辑
    const { top, left } = originalStyle;
    const { top: newTop, left: newLeft } = newStyle;
    let components = canvasData?.components;

    // 过滤掉当前移动的组件，避免与自身比较
    components = components.filter((component) => component.id !== componentId);

    // 查找与新位置重叠的组件
    const exceedComponent = components.find((component) => {
      // 获取新组件的尺寸（从 newStyle 中获取，如果没有则使用原始尺寸）
      const newWidth = newStyle.width || originalStyle.width;
      const newHeight = newStyle.height || originalStyle.height;

      // 构建新组件和现有组件的矩形对象
      const newRect = {
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight,
      };

      const existingRect = {
        left: component.style.left,
        top: component.style.top,
        width: component.style.width,
        height: component.style.height,
      };

      // 首先检查是否有基本重叠
      const hasBasicOverlap = isRectangleOverlap(newRect, existingRect);
      if (hasBasicOverlap) {
        const hasCoreOverlap = isCoreAreaOverlap(newRect, existingRect);
        return hasCoreOverlap;
      }
      return false;
    });

    let resultStyle: any = {};

    if (exceedComponent) {
      // 保存重叠组件的原始位置
      const targetOriginalTop = exceedComponent.style.top;
      const targetOriginalLeft = exceedComponent.style.left;

      // 将当前组件移动到重叠组件的位置
      resultStyle = {
        ...newStyle,
        left: targetOriginalLeft,
      };

      // 同时将重叠组件移动到当前组件的原始位置（实现位置交换）
      exceedComponent.style.left = left;
      // exceedComponent.style.top = top;
    } else {
      resultStyle = {
        ...newStyle,
        left: left,
      };
    }

    return {
      ...resultStyle,
      transition: "all 0.2s",
    };
  }
};

/**
 * 对所有组件进行重新排列（不允许重叠）
 * 垂直布局：按照 top 值排序，重叠时将后面的组件下移
 * 水平布局：按照 left 值排序，重叠时将后面的组件右移
 * @param canvasData 画布数据，包含组件列表
 * @param layout 布局类型，vertical 垂直布局，horizontal 水平布局
 * @returns 重新排列后的组件数据
 */
export const reArrangeComponents = (
  canvasData: any,
  layout: "vertical" | "horizontal"
) => {
  const components = canvasData?.components;

  if (!components || components.length === 0) {
    return canvasData;
  }
  // 1. 根据布局类型进行排序
  // 垂直布局：按照 top 值排序（从上到下）
  // 水平布局：按照 left 值排序（从左到右）
  let sortedComponents: any = [];
  if (layout === "vertical") {
    sortedComponents = [...components].sort((a, b) => {
      return a.style.top - b.style.top;
    });
    // 如果第一个组件没有顶到头，那就 top为 0
    if (sortedComponents.length && sortedComponents[0].style.top !== 0) {
      sortedComponents[0].style.top = 0;
    }
    for (let i = 1; i < sortedComponents.length; i++) {
      const currentComponent = sortedComponents[i];
      const previousComponent = sortedComponents[i - 1];

      // 计算前一个组件的底部位置
      const previousBottom =
        previousComponent.style.top + previousComponent.style.height;

      // 检查当前组件是否与前一个组件重叠
      if (currentComponent.style.top < previousBottom) {
        const newTop = previousBottom + canvasData.componentGap;
        currentComponent.style.top = newTop;
        // 递归检查后续组件是否需要调整
        // 因为当前组件位置改变了，可能会影响后面的组件
        for (let j = i + 1; j < sortedComponents.length; j++) {
          const nextComponent = sortedComponents[j];
          const currentBottom =
            currentComponent.style.top + currentComponent.style.height;
          if (nextComponent.style.top < currentBottom) {
            nextComponent.style.top = currentBottom + canvasData.componentGap;
          } else {
            // 如果没有重叠，后续组件也不会重叠，可以跳出循环
            break;
          }
        }
      } else {
        // 没有重叠也需要重新排一下
        // 检查组件间距是否符合规范，确保统一的间距
        const expectedTop = previousBottom + canvasData.componentGap;
        const actualTop = currentComponent.style.top;

        // 如果实际位置与期望位置相差超过一定阈值，则调整位置
        const positionDifference = Math.abs(actualTop - expectedTop);
        const POSITION_TOLERANCE = 2; // 位置容差，2像素内认为是合理的

        if (positionDifference > POSITION_TOLERANCE) {
          currentComponent.style.top = expectedTop;

          // 调整当前组件位置后，也需要检查后续组件是否需要相应调整
          for (let j = i + 1; j < sortedComponents.length; j++) {
            const nextComponent = sortedComponents[j];
            const currentBottom =
              currentComponent.style.top + currentComponent.style.height;
            const expectedNextTop = currentBottom + canvasData.componentGap;

            // 如果后续组件的位置需要调整
            if (
              Math.abs(nextComponent.style.top - expectedNextTop) >
              POSITION_TOLERANCE
            ) {
              nextComponent.style.top = expectedNextTop;
            } else {
              // 如果后续组件位置合理，则停止调整
              break;
            }
          }
        }
      }
    }
  } else if (layout === "horizontal") {
    sortedComponents = [...components].sort((a, b) => {
      return a.style.left - b.style.left;
    });

    // 如果第一个组件没有靠到最左边，那就 left 为 0
    if (sortedComponents.length && sortedComponents[0].style.left !== 0) {
      sortedComponents[0].style.left = 0;
    }

    // 水平布局的重叠检测和位置调整
    for (let i = 1; i < sortedComponents.length; i++) {
      const currentComponent = sortedComponents[i];
      const previousComponent = sortedComponents[i - 1];

      // 计算前一个组件的右边界位置
      const previousRight =
        previousComponent.style.left + previousComponent.style.width;

      // 检查当前组件是否与前一个组件重叠
      if (currentComponent.style.left < previousRight) {
        const newLeft = previousRight + canvasData.componentGap;
        currentComponent.style.left = newLeft;

        // 递归检查后续组件是否需要调整
        // 因为当前组件位置改变了，可能会影响后面的组件
        for (let j = i + 1; j < sortedComponents.length; j++) {
          const nextComponent = sortedComponents[j];
          const currentRight =
            currentComponent.style.left + currentComponent.style.width;
          if (nextComponent.style.left < currentRight) {
            nextComponent.style.left = currentRight + canvasData.componentGap;
          } else {
            // 如果没有重叠，后续组件也不会重叠，可以跳出循环
            break;
          }
        }
      } else {
        // 没有重叠也需要重新排一下
        // 检查组件间距是否符合规范，确保统一的间距
        const expectedLeft = previousRight + canvasData.componentGap;
        const actualLeft = currentComponent.style.left;

        // 如果实际位置与期望位置相差超过一定阈值，则调整位置
        const positionDifference = Math.abs(actualLeft - expectedLeft);
        const POSITION_TOLERANCE = 2; // 位置容差，2像素内认为是合理的

        if (positionDifference > POSITION_TOLERANCE) {
          currentComponent.style.left = expectedLeft;

          // 调整当前组件位置后，也需要检查后续组件是否需要相应调整
          for (let j = i + 1; j < sortedComponents.length; j++) {
            const nextComponent = sortedComponents[j];
            const currentRight =
              currentComponent.style.left + currentComponent.style.width;
            const expectedNextLeft = currentRight + canvasData.componentGap;

            // 如果后续组件的位置需要调整
            if (
              Math.abs(nextComponent.style.left - expectedNextLeft) >
              POSITION_TOLERANCE
            ) {
              nextComponent.style.left = expectedNextLeft;
            } else {
              // 如果后续组件位置合理，则停止调整
              break;
            }
          }
        }
      }
    }
  }

  // 2. 组件重叠检测和位置调整已在上述布局逻辑中完成

  // 3. 更新画布数据中的组件顺序
  // canvasData.components = sortedComponents;
  return canvasData;
};

// sandbox 模式下，在不同布局下拖拽组件导致宽度超出画布宽度时，需要调整画布宽度
// 通过 excludeCompression 和 allowOverride 字段控制画布间的挤压和覆盖权限
export const adjustCanvasWidth = (
  componentStyle: any,
  triggerCanvas: any,
  otherData?: any
) => {
  const editorDataStore = useEditorDataStore();
  const sandboxCanvas = editorDataStore.sandboxCanvas;

  // 获取缩放比例
  const canvasStyleScale = editorDataStore.sandboxCanvasStyle?.scale || 1;
  const mainContainer =
    editorDataStore.editorMap[triggerCanvas.id].parentElement.parentElement;
  const mainContainerWidth = Math.round(
    mainContainer.getBoundingClientRect().width / canvasStyleScale
  );

  // 查找当前画布右侧的画布(并且支持被当前画布挤压的画布)
  let canvasAboutRight: any = [];

  const obstacleCnanvas: any = [];

  const outherCanvas: any = Object.values(sandboxCanvas).filter(
    (canvas) => canvas.id !== triggerCanvas.id
  );

  if (triggerCanvas.expansionDirection === "right") {
    outherCanvas.forEach((item) => {
      if (
        triggerCanvas.squeezing.includes(item.id) &&
        (item?.left || 0) > triggerCanvas.left
      ) {
        canvasAboutRight.push(item);
      }
      if (triggerCanvas.obstacle.includes(item.id)) {
        obstacleCnanvas.push(item);
      }
    });

    // 获取所有障碍物最左侧的 left
    const obstacleLeft = obstacleCnanvas.reduce((min, item) => {
      return Math.min(min, item.left);
    }, Infinity);

    // 获取最左侧障碍物的宽度
    const obstacleLeftWidth = obstacleCnanvas.find(
      (item) => item.left === obstacleLeft
    )?.width;

    const squeezingCanvas = outherCanvas.filter((item) =>
      triggerCanvas.squeezing.includes(item.id)
    );

    const squeezingCanvasMaxWidth = squeezingCanvas.reduce((max, item) => {
      return Math.max(max, item.width);
    }, 0);

    const widthBuffer = otherData.newLeft + otherData.newWidth;

    const componentAllSpace = triggerCanvas.components
      .filter((item) => item.id !== otherData.componentId)
      .map((item) => {
        const componentItem = otherData.originalCanvasData.components.find(
          (citem) => citem.id === item.id
        );
        return (
          Math.round(item.style.width) +
          (componentItem.style.left < 0 ? 0 : componentItem.style.left)
        );
      });

    const minSpace =
      Math.max(...componentAllSpace) > triggerCanvas.minWidth
        ? Math.max(...componentAllSpace)
        : triggerCanvas.minWidth;

    if (
      widthBuffer * canvasStyleScale +
        squeezingCanvasMaxWidth * canvasStyleScale >
      obstacleLeft
    ) {
      triggerCanvas.width =
        mainContainerWidth - obstacleLeftWidth - squeezingCanvasMaxWidth;
      return {
        width:
          mainContainerWidth -
          obstacleLeftWidth -
          squeezingCanvasMaxWidth -
          otherData.newLeft,
      };
    }

    if (widthBuffer < minSpace) {
      triggerCanvas.width = minSpace;
      return true;
    }

    triggerCanvas.width = widthBuffer;
    outherCanvas.forEach((item) => {
      if (triggerCanvas.squeezing.includes(item.id)) {
        item.left = widthBuffer;
      }
    });
    return true;
  }

  if (triggerCanvas.expansionDirection === "left") {
    // 查找当前画布左侧的画布(并且支持被当前画布挤压的画布)
    let canvasAboutLeft: any = [];
    const obstacleCanvas: any = [];

    outherCanvas.forEach((item) => {
      if (
        triggerCanvas.squeezing.includes(item.id) &&
        (item?.left || 0) < triggerCanvas.left
      ) {
        canvasAboutLeft.push(item);
      }
      if (triggerCanvas.obstacle.includes(item.id)) {
        obstacleCanvas.push(item);
      }
    });

    // 获取所有障碍物最右侧的 right (left + width)
    const obstacleRight = obstacleCanvas.reduce((max, item) => {
      return Math.max(max, item.left + item.width);
    }, -Infinity);

    const leftBuffer =
      otherData.originalCanvasData.left + otherData.newLeft * canvasStyleScale;
    const widthBuffer = otherData.originalCanvasData.width - otherData.newLeft;

    // 障碍物判定
    if (leftBuffer <= obstacleRight * canvasStyleScale) {
      triggerCanvas.width = mainContainerWidth - obstacleRight;

      return {
        left: 0,
        width: triggerCanvas.width - otherData.componentRightSpace,
      };
    }

    const componentAllSpace = triggerCanvas.components
      .filter((item) => item.id !== otherData.componentId)
      .map((item) => {
        console.log(item.style);
        if (item.style.width + item.style.left > triggerCanvas.width) {
          item.style.left = 0;
        }

        const componentItem = otherData.originalCanvasData.components.find(
          (citem) => citem.id === item.id
        );
        const rightSpace =
          otherData.originalCanvasData.width -
          (Math.round(componentItem.style.width) +
            (componentItem.style.left < 0 ? 0 : componentItem.style.left));
        return Math.round(item.style.width) + (rightSpace < 0 ? 0 : rightSpace);
      });

    const minSpace =
      Math.max(...componentAllSpace) > triggerCanvas.minWidth
        ? Math.max(...componentAllSpace)
        : triggerCanvas.minWidth;

    // 最小边界判定
    if (widthBuffer <= minSpace) {
      triggerCanvas.width = minSpace;
      triggerCanvas.left = mainContainerWidth * canvasStyleScale - minSpace;
      return {
        canvasMinWidth: minSpace,
      };
    }

    if (
      otherData.newLeft <= 0 ||
      triggerCanvas.width > otherData.originalCanvasData.minWidth
    ) {
      triggerCanvas.left = leftBuffer;
      triggerCanvas.width = widthBuffer;
      componentStyle.left = 0;
      otherData.originalCanvasData.components.forEach((item) => {
        if (item.id !== otherData.componentId) {
          const component = triggerCanvas.components.find(
            (component) => component.id === item.id
          );
          const left =
            item.style.left +
            (otherData.originalCanvasData.left - leftBuffer) / canvasStyleScale;
          component.style.left = left < 0 ? 0 : Math.round(left);
        }
      });
      return {
        left: 0,
      };
    }

    return true;
  }
};

// 挤压组件（当垂直布局的时候，组件高度发生变化的时候，需要调整其他组件的top的位置, 当水平布局的时候，组件宽度发生变化的时候，需要调整其他组件的left的位置）
export const adjustComponentPosition = (
  componentStyle: any,
  canvasData: any,
  componentId: string,
  pos: string,
  otherData?: any
) => {
  const originComponent = otherData.originalCanvasData.components.find(
    (item) => item.id === componentId
  );
  if (canvasData.layout === "vertical") {
    // 检测当前组件上下是否有组件，如果上面有组件则无法继续调整
    // 根据 pos类型来判断 是操作的是哪个位置

    if (pos === "top") {
      return true;
    }
    if (pos === "leftTop" || pos == "rightTop") {
      if (
        otherData.resultTop < originComponent.style.top ||
        otherData.resultTop < 0
      ) {
        return {
          resultTop: originComponent.style.top,
          resultHeight: originComponent.style.height,
        };
      }
      return true;
    }

    if (["rightBottom", "leftBottom", "bottom"].includes(pos)) {
      // if (otherData.resultHeight > originComponent.style.height) {
      // 获取画布的高度
      const canvasHeight = canvasData.height;
      // 获取所有组件的高度 + 组件的top
      const totalComponentHeight =
        otherData.originalCanvasData.components.reduce((acc, item) => {
          return acc + item.style.height;
        }, 0);

      const componentGapHeight =
        canvasData.components.length > 1
          ? canvasData.componentGap * canvasData.components.length
          : 0;

      // 剩余区域高度 = 画布高度 - 组件高度 - 组件间距高度
      const totalOccupiedAraeHeight =
        canvasHeight - (totalComponentHeight + componentGapHeight);
      // 获取原始组件
      const originComponet = otherData.originalCanvasData.components.find(
        (item) => item.id === componentId
      );

      // 现在的高度和原来的高度的差值
      const heightDifference =
        otherData.resultHeight - originComponet.style.height;

      if (totalOccupiedAraeHeight > heightDifference) {
        canvasData.components.forEach((item) => {
          if (item.id !== componentId && item.style.top > otherData.resultTop) {
            const component = otherData.originalCanvasData.components.find(
              (citem) => citem.id === item.id
            );
            item.style.top = component.style.top + heightDifference;
          }
        });
      } else {
        return {
          resultHeight: componentStyle.height,
        };
      }
      // }
      return true;
    }
  }

  if (canvasData.layout === "horizontal") {
    if (pos === "leftTop") return true;
    if (pos === "rightTop") return true;
  }

  return true;
};
