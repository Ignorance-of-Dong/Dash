<!--
 * @Author: zhangzheng
 * @Date: 2025-09-30 15:29:27
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-15 16:51:59
 * @Description: 
-->
<template>
  <el-row class="custom-main">
    <div class="scale-area">
      <el-input-number
        @keydown.stop
        @keyup.stop
        v-model="scale"
        effect="dark"
        :min="10"
        :max="200"
        size="small"
        controls-position="right"
        @change="handleScaleChange()"
        class="scale-input-number"
      />

      <el-icon
        @click="scaleDecrease(1)"
        class="hover-icon-custom"
        style="margin-right: 12px"
      >
        <ZoomOut
      /></el-icon>
      <el-slider
        style="width: 100px; margin-right: 12px"
        v-model="scale"
        :min="10"
        :max="200"
        tooltip-theme="light"
        @change="handleScaleChange()"
        size="small"
      />
      <el-icon @click="scaleIncrease(1)" class="hover-icon-custom">
        <ZoomIn />
      </el-icon>
      <el-divider direction="vertical" class="custom-divider_scale" />
      <el-tooltip
        effect="light"
        :content="t('visualization.locate_tips')"
        placement="top"
      >
        <el-icon
          @click="reposition"
          class="hover-icon-custom"
          style="margin-right: 12px"
          ><FullScreen
        /></el-icon>
      </el-tooltip>
    </div>
  </el-row>
</template>

<script setup lang="ts">
import { FullScreen, ZoomOut, ZoomIn } from "@element-plus/icons-vue";
import { useEditorDataStore } from "../store/editorData";
import { storeToRefs } from "pinia";
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { changeComponentsSizeWithScaleUtil } from "../utils/changeComponentsSizeWithScale";

const { changeSizeWithScale, changeSizeWithScaleAdaptor } =
  changeComponentsSizeWithScaleUtil();

import { useEmitt } from "../hooks/useEmitt";

const editorDataStore = useEditorDataStore();
const { canvasStyleData, editMode } = storeToRefs(editorDataStore);
const scale = ref(60);
const scaleChangeReady = ref(true);
const t = (a) => a;
const handleScaleChange = () => {
  if (scaleChangeReady.value) {
    scaleChangeReady.value = false;
    setTimeout(() => {
      // 画布比例设一个最小值，不能为 0
      scale.value = ~~scale.value || 10;
      scale.value = scale.value < 10 ? 10 : scale.value;
      scale.value = scale.value > 200 ? 200 : scale.value;
      changeSizeWithScale(scale.value);
      changeSizeWithScaleAdaptor(scale.value);
      scaleChangeReady.value = true;
    }, 150);
  }
};

const scaleDecrease = (speed = 1) => {
  if (scale.value > 10) {
    scale.value = scale.value - speed;
    handleScaleChange();
  }
};

const scaleIncrease = (speed = 1) => {
  if (scale.value < 200) {
    scale.value = scale.value + speed;
    handleScaleChange();
  }
};

const reposition = () => {
  useEmitt().emitter.emit("initScroll");
};

const handleMouseWheel = (e) => {
  if (
    editMode.value === "preview" ||
    (Math.abs(e.deltaX) !== 0 && Math.abs(e.deltaY) !== 0)
  ) {
    return;
  }
  if (e.ctrlKey) {
    if (e.deltaY > 0) {
      //向内 缩小
      scaleDecrease(3);
      e.stopPropagation();
      e.preventDefault();
    }
    if (e.deltaY < 0) {
      //向外 放大
      scaleIncrease(3);
      e.stopPropagation();
      e.preventDefault();
    }
  }
};

onMounted(() => {
  window.addEventListener("wheel", handleMouseWheel, { passive: false });
  setTimeout(() => {
    scale.value = canvasStyleData.value.scale;
    nextTick(() => {
      useEmitt().emitter.emit("initScroll");
    });
  }, 1000);
  useEmitt({
    name: "canvasScrollRestore",
    callback: function () {
      // 用于全屏后还原编辑状态大小
      changeSizeWithScale(scale.value);
    },
  });
});

onUnmounted(() => {
  window.removeEventListener("wheel", handleMouseWheel);
});
</script>

<style scoped>
.custom-main {
  display: flex;
  width: 100%;
  justify-content: right;
  height: 45px;
  background-color: #1a1a1a;
  border-top: 1px solid #363636;
  color: #fff;
  z-index: 2;
  transition: 0.5s;
  .scale-area {
    display: flex;
    align-items: center;

    :deep(.ed-input-number__decrease) {
      --ed-input-number-controls-height: 12px;
    }
  }
}
:deep(.ed-input--dark .ed-input__wrapper),
:deep(
    .ed-input-number--dark:not(.is-disabled)
      .ed-input-number__decrease:not(.is-disabled)
  ),
:deep(
    .ed-input-number--dark:not(.is-disabled)
      .ed-input-number__increase:not(.is-disabled)
  ) {
  background-color: #1a1a1a;
}

.custom-divider_scale {
  height: 18px;
  border-color: #ffffff26;
}

.scale-input-number {
  height: 24px;
  line-height: 24px;
  width: 80px;
  margin-right: 16px;

  :deep(.ed-input__wrapper) {
    position: relative;
    padding: 0 38px 0 8px;
    &::after {
      position: absolute;
      content: "%";
      right: 35px;
      top: 1px;
      height: 24px;
      line-height: 24px;
    }
  }
}

.custom-divider {
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  margin: 0 16px;
}

.hover-icon-custom {
  cursor: pointer;
  height: 24px !important;
  width: 24px !important;
  font-size: 16px !important;
  border-radius: 4px;
  color: #646a73 !important;

  &[aria-expanded="true"] {
    background: rgba(31, 35, 41, 1);
  }

  &:hover {
    background: rgba(31, 35, 41, 0.5);
  }

  &:active {
    background: rgba(31, 35, 41, 1);
  }
}
</style>
