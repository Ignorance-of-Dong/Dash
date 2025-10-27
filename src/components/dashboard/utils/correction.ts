import { useEditorDataStore } from "../store/editorData";

/*
 * @Author: zhangzheng
 * @Date: 2025-10-22 17:22:01
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-27 19:17:16
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

const getElementPosition = (element) => {
  const parent = element.parentElement;
  const elementRect = element.getBoundingClientRect();

  const parentRect = parent.getBoundingClientRect();

  return elementRect;
};

// sandbox 模式下，在不同布局下拖拽组件导致宽度超出画布宽度时，需要调整画布宽度
// 通过 excludeCompression 和 allowOverride 字段控制画布间的挤压和覆盖权限
export const adjustCanvasWidth = (componentStyle: any, triggerCanvas: any) => {
  const editorDataStore = useEditorDataStore();
  const sandboxCanvas = editorDataStore.sandboxCanvas;

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

    // 计算画布中所有组件的最大占位宽度（left + width）
    // 注意：components数组可能还未更新，所以需要同时考虑当前正在调整的组件
    const componentsMaxRightEdge = triggerCanvas.components.reduce((max, comp) => {
      const rightEdge = (comp.style.left || 0) + (comp.style.width || 0);
      return Math.max(max, rightEdge);
    }, 0);
    
    // 当前正在调整的组件的右边界
    const currentComponentRightEdge = (componentStyle.left || 0) + (componentStyle.width || 0);
    
    // 取两者的最大值，确保考虑了最新状态
    const maxComponentRightEdge = Math.max(componentsMaxRightEdge, currentComponentRightEdge);

    // 计算画布理论上应该有的宽度（基于组件占位）
    let targetCanvasWidth = Math.round(Math.max(maxComponentRightEdge, triggerCanvas.minWidth));
    
    // 检查是否会与右侧的 squeezing 画布重叠，如果会则限制画布宽度
    if (canvasAboutRight.length > 0) {
      // 找到最左侧的 squeezing 画布
      const leftmostSqueezingCanvas = canvasAboutRight.reduce((leftmost, canvas) => {
        return canvas.left < leftmost.left ? canvas : leftmost;
      }, canvasAboutRight[0]);
      
      // 计算画布的最大允许宽度（不会覆盖到 squeezing 画布的位置）
      const maxAllowedWidth = Math.round(leftmostSqueezingCanvas.left - triggerCanvas.left - (editorDataStore.sandboxCanvasGap || 20));
      
      // 如果计算出的宽度会导致覆盖，则限制为最大允许宽度
      if (targetCanvasWidth > maxAllowedWidth && maxAllowedWidth > 0) {
        targetCanvasWidth = Math.round(Math.max(maxAllowedWidth, triggerCanvas.minWidth));
      }
    }

    // 计算组件的右边界（取整确保精确）
    const componentRightEdge = Math.round(componentStyle.left + componentStyle.width);
    
    // 判断组件是否超出当前画布宽度（使用当前宽度而不是minWidth）
    if (componentRightEdge > triggerCanvas.width) {
      // 组件扩大：需要扩展画布
      const itemc = componentRightEdge - triggerCanvas.width;

      console.log(itemc, "扩大距离");
      canvasAboutRight = canvasAboutRight.sort((a, b) => {
        return a.left - b.left;
      });
      // 倒着循环，向右推挤压的画布
      for (let i = canvasAboutRight.length - 1; i >= 0; i--) {
        const item = canvasAboutRight[i];
        if (item.left + itemc + item.width >= obstacleLeft) {
          // 碰到障碍物，限制组件宽度（取整）
          componentStyle.width = Math.round(triggerCanvas.width - componentStyle.left);
          // 将 squeezing 画布放置在画布右边界后面（画布右边界 = triggerCanvas.left + triggerCanvas.width）
          const canvasRightEdge = Math.round(triggerCanvas.left + triggerCanvas.width);
          item.left = Math.round(canvasRightEdge + (editorDataStore.sandboxCanvasGap || 20));
          return false;
        } else {
          item.left = Math.round(item.left + itemc);
        }
      }
      // 更新画布宽度为组件的右边界（取整）
      triggerCanvas.width = Math.round(componentRightEdge);
      return true;
    } else {
      // 组件缩小或未超出：根据所有组件的最大占位宽度调整画布
      const widthChange = triggerCanvas.width - targetCanvasWidth;
      
      if (widthChange > 0) {
        // 画布宽度缩小了，需要将右侧被挤压的画布向左拉回
        console.log(widthChange, "缩小距离");
        
        canvasAboutRight = canvasAboutRight.sort((a, b) => {
          return a.left - b.left;
        });
        
        // 正序循环，向左拉回被挤压的画布
        for (let i = 0; i < canvasAboutRight.length; i++) {
          const item = canvasAboutRight[i];
          // 计算画布应该在的新位置（向左移动，取整）
          const newLeft = Math.round(item.left - widthChange);
          
          // 确保不会移动到当前画布内部（至少保持一个gap的距离，取整）
          const minLeft = Math.round(triggerCanvas.left + targetCanvasWidth + (editorDataStore.sandboxCanvasGap || 20));
          
          if (newLeft >= minLeft) {
            // 可以安全地向左移动
            item.left = newLeft;
          } else {
            // 不能完全回退，只能移动到最小允许位置
            item.left = minLeft;
          }
        }
      }
      
      // 更新画布宽度（取整）
      triggerCanvas.width = Math.round(targetCanvasWidth);
      return true;
    }
  }

  if (triggerCanvas.expansionDirection === "left") {
    // 计算画布中所有组件的最大宽度（因为左侧扩展时组件left都是0）
    // 注意：components数组可能还未更新，所以需要同时考虑当前正在调整的组件
    const componentsMaxWidth = triggerCanvas.components.reduce((max, item) => {
      return Math.max(max, item.style.width || 0);
    }, 0);
    
    // 当前正在调整的组件的宽度
    const currentComponentWidth = componentStyle.width || 0;
    
    // 取两者的最大值，确保考虑了最新状态
    const maxComponentWidth = Math.max(componentsMaxWidth, currentComponentWidth);

    // 计算画布理论上应该有的宽度（基于组件占位，取整）
    let targetCanvasWidth = Math.round(Math.max(maxComponentWidth, triggerCanvas.minWidth));

    const canvasAboutLeft: any = [];
    const triggerCanvasPosition = getElementPosition(
      editorDataStore.editorMap[triggerCanvas.id]
    );
    outherCanvas.forEach((item) => {
      if (
        triggerCanvas.squeezing.includes(item.id) &&
        (item?.left || 0) < triggerCanvasPosition.left
      ) {
        canvasAboutLeft.push(item);
      }
      if (triggerCanvas.obstacle.includes(item.id)) {
        obstacleCnanvas.push(item);
      }
    });

    const obstacleLeft = obstacleCnanvas.sort((a, b) => {
      return a.left - b.left;
    });

    const maxLeftCanvas =
      obstacleLeft.length > 0 ? obstacleLeft[0] : { left: 0, width: 0 };
    
    // 检查targetCanvasWidth是否会导致画布左边界覆盖到左侧的 squeezing 画布
    if (canvasAboutLeft.length > 0) {
      // 找到最右侧的 squeezing 画布（最接近当前画布的）
      const rightmostSqueezingCanvas = canvasAboutLeft.reduce((rightmost, canvas) => {
        const canvasRight = canvas.left + canvas.width;
        const rightmostRight = rightmost.left + rightmost.width;
        return canvasRight > rightmostRight ? canvas : rightmost;
      }, canvasAboutLeft[0]);
      
      // 计算如果使用 targetCanvasWidth，画布的新左边界（取整）
      // 左侧扩展时，画布右边界相对固定，左边界 = 右边界 - width
      const currentRightEdge = Math.round(triggerCanvas.left + triggerCanvas.width);
      const newLeftEdge = Math.round(currentRightEdge - targetCanvasWidth);
      
      // 计算左侧 squeezing 画布的右边界（取整）
      const squeezingRightEdge = Math.round(rightmostSqueezingCanvas.left + rightmostSqueezingCanvas.width);
      
      // 确保画布左边界不会覆盖到 squeezing 画布（保持gap距离，取整）
      const minAllowedLeft = Math.round(squeezingRightEdge + (editorDataStore.sandboxCanvasGap || 20));
      
      // 如果计算出的左边界会导致覆盖，则限制 targetCanvasWidth
      if (newLeftEdge < minAllowedLeft) {
        // 重新计算允许的最大宽度（取整）
        const maxAllowedWidth = Math.round(currentRightEdge - minAllowedLeft);
        if (maxAllowedWidth > 0) {
          targetCanvasWidth = Math.round(Math.min(targetCanvasWidth, maxAllowedWidth));
          // 同时确保不低于最小宽度
          targetCanvasWidth = Math.round(Math.max(targetCanvasWidth, triggerCanvas.minWidth));
        }
      }
    }
    
    // 判断组件宽度是否超出当前画布宽度（使用当前宽度而不是minWidth）
    if (componentStyle.width > triggerCanvas.width) {
      // 组件扩大：需要向左扩展画布
      const itemc = componentStyle.width - triggerCanvas.width;
      if (
        triggerCanvas.left - itemc <
        maxLeftCanvas.left +
          maxLeftCanvas.width +
          editorDataStore.sandboxCanvasGap
      ) {
        // 碰到障碍物，限制组件宽度（取整）
        // 计算允许的最大宽度
        const maxAllowedExpansion = Math.round(triggerCanvas.left - maxLeftCanvas.left - maxLeftCanvas.width - editorDataStore.sandboxCanvasGap);
        if (maxAllowedExpansion > 0) {
          componentStyle.width = Math.round(triggerCanvas.width + maxAllowedExpansion);
        } else {
          componentStyle.width = Math.round(triggerCanvas.width);
        }
        componentStyle.left = 0;
        return false;
      }

      // 向左扩展画布，可能需要推挤左侧的画布
      canvasAboutLeft.sort((a, b) => b.left - a.left); // 从右到左排序
      
      // 推挤左侧的画布向左移动
      for (let i = 0; i < canvasAboutLeft.length; i++) {
        const item = canvasAboutLeft[i];
        // 检查是否会与障碍物冲突（取整）
        const newLeft = Math.round(item.left - itemc);
        if (newLeft >= maxLeftCanvas.left + maxLeftCanvas.width + editorDataStore.sandboxCanvasGap) {
          item.left = newLeft;
        } else {
          // 如果会冲突，停止扩展，限制组件宽度（取整）
          componentStyle.width = Math.round(triggerCanvas.width);
          componentStyle.left = 0;
          // 将 squeezing 画布放置在画布左边界前面（取整）
          // 画布左边界会在当前位置，squeezing 画布应该在左边界 - gap - squeezing画布宽度
          item.left = Math.round(triggerCanvas.left - (editorDataStore.sandboxCanvasGap || 20) - item.width);
          return false;
        }
      }

      triggerCanvas.width = Math.round(componentStyle.width);
      componentStyle.left = 0;
      triggerCanvas.left = Math.round(triggerCanvas.left - itemc);
    } else {
      // 组件缩小或未超出：根据所有组件的最大宽度调整画布
      // 左侧扩展时，画布宽度变化需要调整画布的left位置
      const widthChange = triggerCanvas.width - targetCanvasWidth;
      if (widthChange > 0) {
        // 画布宽度需要缩小（画布向右收缩）
        console.log(widthChange, "左侧画布缩小距离");
        
        // 计算画布缩小后的新left位置（取整）
        const newTriggerCanvasLeft = Math.round(triggerCanvas.left + widthChange);
        
        // 将左侧被挤压的画布向右拉回
        canvasAboutLeft.sort((a, b) => b.left - a.left); // 从右到左排序
        
        for (let i = 0; i < canvasAboutLeft.length; i++) {
          const item = canvasAboutLeft[i];
          // 计算画布应该在的新位置（向右移动，取整）
          const newLeft = Math.round(item.left + widthChange);
          
          // 确保不会移动到当前画布内部（至少保持一个gap的距离，取整）
          // 使用更新后的triggerCanvas.left来计算边界
          const maxAllowedLeft = Math.round(newTriggerCanvasLeft - (editorDataStore.sandboxCanvasGap || 20) - item.width);
          
          if (newLeft <= maxAllowedLeft) {
            // 可以安全地向右移动
            item.left = newLeft;
          } else {
            // 不能完全回退，只能移动到最大允许位置
            item.left = maxAllowedLeft;
          }
        }
        
        triggerCanvas.width = Math.round(targetCanvasWidth);
        triggerCanvas.left = newTriggerCanvasLeft;
      } else if (widthChange < 0) {
        // 理论上不应该走到这里，因为targetCanvasWidth是基于组件计算的
        // 但为了安全，还是处理一下（取整）
        triggerCanvas.width = Math.round(targetCanvasWidth);
      }
      // 确保组件left为0（左侧扩展的特性）
      componentStyle.left = 0;
    }

    return true;
  }
};
