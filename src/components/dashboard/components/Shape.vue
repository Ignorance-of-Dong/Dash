<!--
 * @Author: zhangzheng
 * @Date: 2025-10-13 18:57:42
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-14 15:03:23
 * @Description: 
-->
<template>
  <div class="shape">
    <div class="shape-outer">
      <div
        class="shape-inner"
        ref="componentInnerRef"
        :id="viewDemoInnerId"
        @click="selectCurComponent"
        @mousedown="handleInnerMouseDownOnShape"
      >
        <div class="component-slot" :style="slotStyle">
          <slot></slot>
        </div>
        <div
          v-for="item in element.isActive ? getPointList() : []"
          :key="item"
          class="shape-point"
          :style="getPointStyle(item)"
          @mousedown="handleMouseDownOnPoint(item, $event)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  width: {
    type: Number,
    default: 100,
  },
  element: {
    type: Object,
    required: true,
  },
  defaultStyle: {
    type: Object,
    required: true,
  },
  baseCellInfo: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isTabMoveCheck: {
    type: Boolean,
    required: true,
  },
});

const {
  element,
  defaultStyle,
  baseCellInfo,
  index,
  isTabMoveCheck,
  canvasId,
  scale,
  canvasActive,
} = toRefs(props);
const pointList = ["lt", "t", "rt", "r", "rb", "b", "lb", "l"];

const getPointList = () => {
  return pointList;
};

const getPointStyle = (point) => {
  let { width, height } = defaultStyle.value;
  const { sizeX, sizeY } = element.value;
  if (dashboardActive.value && !element.value["isPlayer"]) {
    width =
      sizeX * baseCellInfo.value.baseWidth - 2 * baseCellInfo.value.curGap;
    height =
      sizeY * baseCellInfo.value.baseHeight - 2 * baseCellInfo.value.curGap;
  } else {
    width = width - 2 * baseCellInfo.value.curGap;
    height = height - 2 * baseCellInfo.value.curGap;
  }
  const hasT = /t/.test(point);
  const hasB = /b/.test(point);
  const hasL = /l/.test(point);
  const hasR = /r/.test(point);
  let newLeft = 0;
  let newTop = 0;

  // 四个角的点
  if (point.length === 2) {
    newLeft = hasL ? 0 : width;
    newTop = hasT ? 0 : height;
  } else {
    // 上下两点的点，宽度居中
    if (hasT || hasB) {
      newLeft = width / 2;
      newTop = hasT ? 0 : height;
    }

    // 左右两边的点，高度居中
    if (hasL || hasR) {
      newLeft = hasL ? 0 : width;
      newTop = Math.floor(height / 2);
    }
  }

  const style = {
    marginLeft: "-4px",
    marginTop: "-4px",
    left: `${newLeft}px`,
    top: `${newTop}px`,
    cursor: cursors.value[point],
  };

  return style;
};

const viewDemoInnerId = computed(
  () => "enlarge-inner-shape-" + element.value.id
); // 预览内部ID

const handleMouseDownOnPoint = (point, e) => {
  if (!canvasActive.value) {
    return;
  }
  dashboardActive.value && emit("onStartResize", e);
  dvMainStore.setInEditorStatus(true);
  dvMainStore.setClickComponentStatus(true);
  e.stopPropagation();
  e.preventDefault();

  const style = { ...defaultStyle.value };

  // 组件宽高比
  const proportion = style["width"] / style["height"];

  // 组件中心点
  const center = {
    x: style["left"] + style["width"] / 2,
    y: style["top"] + style["height"] / 2,
  };

  // 获取画布位移信息
  const editorRectInfo =
    editorMap.value[canvasId.value]?.getBoundingClientRect();
  if (!editorRectInfo) {
    return;
  }
  // 获取 point 与实际拖动基准点的差值
  const pointRect = e.target.getBoundingClientRect();
  // 当前点击圆点相对于画布的中心坐标
  const curPoint = {
    x: Math.round(
      pointRect.left -
        editorRectInfo.left +
        e.target.offsetWidth / 2 +
        offsetGapAdaptor("x", point) / 2
    ),
    y: Math.round(
      pointRect.top -
        editorRectInfo.top +
        e.target.offsetHeight / 2 +
        offsetGapAdaptor("y", point) / 2
    ),
  };

  // 获取对称点的坐标 problem point
  const symmetricPoint = {
    x: center.x - (curPoint.x - center.x) - offsetGapAdaptor("x", point) / 4,
    y: center.y - (curPoint.y - center.y) - offsetGapAdaptor("y", point) / 4,
  };

  // 是否需要保存快照
  let needSave = false;
  let isFirst = true;

  const needLockProportion = isNeedLockProportion();
  const originRadio = curComponent.value.aspectRatio;
  const baseGroupComponentsRadio = {};
  // 计算初始状态 分组内组件宽高占比
  if (areaData.value.components.length > 0) {
    areaData.value.components.forEach((groupComponent) => {
      baseGroupComponentsRadio[groupComponent.id] = {
        topRadio: (groupComponent.style.top - style.top) / style.height,
        leftRadio: (groupComponent.style.left - style.left) / style.width,
        widthRadio: groupComponent.style.width / style.width,
        heightRadio: groupComponent.style.height / style.height,
      };
    });
  }

  const move = (moveEvent) => {
    // 第一次点击时也会触发 move，所以会有“刚点击组件但未移动，组件的大小却改变了”的情况发生
    // 因此第一次点击时不触发 move 事件
    if (isFirst) {
      isFirst = false;
      return;
    }

    needSave = true;
    const curPosition = {
      x:
        moveEvent.clientX -
        Math.round(editorRectInfo.left) +
        offsetGapAdaptor("x", point),
      y:
        moveEvent.clientY -
        Math.round(editorRectInfo.top) +
        offsetGapAdaptor("y", point),
    };
    calculateComponentPositionAndSize(
      point,
      style,
      curPosition,
      proportion,
      needLockProportion,
      {
        center,
        curPoint,
        symmetricPoint,
      }
    );
    //Temp dataV坐标偏移
    offsetDataVAdaptor(style, point);
    // 保持宽搞比例调整
    if (curComponent.value.maintainRadio) {
      // 高度偏移量
      const heightOffset = style.height - defaultStyle.value.height;
      // 宽度偏移量
      const widthOffset = style.width - defaultStyle.value.width;
      // 保持宽高比例是相对宽度偏移量
      const adaptorWidthOffset = heightOffset * originRadio;
      if (pointCorner.includes(point)) {
        style.height = defaultStyle.value.width / originRadio;
      } else if (Math.abs(widthOffset) > Math.abs(adaptorWidthOffset)) {
        // 调整高度
        style.height = defaultStyle.value.width / originRadio;
      } else {
        // 调整宽度
        style.width = defaultStyle.value.height * originRadio;
      }
    }
    calculateRadioComponentPositionAndSize(point, style, symmetricPoint);

    dvMainStore.setShapeStyle(
      style,
      areaData.value.components,
      "resize",
      baseGroupComponentsRadio
    );
    // 矩阵逻辑 如果当前是仪表板（矩阵模式）则要进行矩阵重排
    dashboardActive.value && emit("onResizing", moveEvent);
    element.value["resizing"] = true;
    //如果当前组件是Group分组或者Tab 则要进行内部组件深度计算
    if (
      ["Group"].includes(element.value.component) ||
      (["DeTabs"].includes(element.value.component) &&
        !element.value.resizeInnerKeep)
    ) {
      groupSizeStyleAdaptor(element.value);
    }

    //如果当前画布是Group内部画布 则对应组件定位在resize时要还原到groupStyle中
    if (isGroupCanvas(canvasId.value) || isTabCanvas(canvasId.value)) {
      groupStyleRevert(element.value, {
        width: parentNode.value.offsetWidth,
        height: parentNode.value.offsetHeight,
      });
    }
  };

  const up = () => {
    // 如果内部组件保持尺寸时，这里在鼠标抬起时，重新计算一下内部组件占比
    if (
      ["DeTabs"].includes(element.value.component) &&
      element.value.resizeInnerKeep
    ) {
      tabInnerStyleRevert(element.value);
    }

    dashboardActive.value && emit("onMouseUp");
    element.value["resizing"] = false;
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
    needSave &&
      snapshotStore.recordSnapshotCacheWithPositionChange(
        "shape-handleMouseDownOnPoint-up"
      );
    handleGroupComponent();
  };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
};
</script>

<style scoped>
.shape {
  position: absolute;
  .refresh-from-pc {
    position: absolute;
    right: 38px;
    top: 12px;
    z-index: 2;
    font-size: 16px;
    cursor: pointer;
    color: var(--ed-color-primary);
  }
  .del-from-mobile {
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 2;
    font-size: 16px;
    cursor: pointer;
    color: var(--ed-color-primary);
  }
  .shape-outer {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .component-slot {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
  }
}
</style>
