<!--
 * @Author: yuanzengding
 * @Date: 2023-01-17 14:33:18
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-21 10:04:50
-->
<template>
  <div class="dtcs-chart" :style="{ width, height }">
    <div
      v-if="Object.keys(option).length > 0"
      class="container"
      ref="dtcsChartRef"
    ></div>
    <dtcs-no-data v-if="Object.keys(option).length == 0" />
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  shallowRef,
  unref,
  ref,
} from "vue";
import * as echarts from "echarts";
// import { isEmptyObject } from "@factverse/common/utils/common";
import { useResizeObserver } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    option: null | undefined | any;
    width?: string;
    height?: string;
    resizeable?: boolean;
    theme?: any;
    type?: string;
  }>(),
  {
    width: "100%",
    height: "100%",
    resizeable: true,
    theme: () => ({}),
  }
);
// 获取dom
const dtcsChartRef = ref<any>();
const dtcsChart = shallowRef<any>();
let timer = ref<any>();

onMounted(async () => {
  //   if (!isEmptyObject(props.option)) {
  // await nextTick();
  init();
  //   }
});
onBeforeUnmount(() => {
  if (props.resizeable) {
    window.removeEventListener("resize", onResize);
  }
  if (timer) {
    clearTimeout(timer.value);
  }
});

// 创建图标
const init = () => {
  const theme = Object.keys(props.theme).length > 0 ? props.theme : {};
  dtcsChart.value = echarts.init(unref(dtcsChartRef.value), theme);
  dtcsChart.value.setOption(props.option, true);
  if (props.resizeable) {
    window.addEventListener("resize", onResize);
    useResizeObserver(unref(dtcsChartRef.value), onResize);
  }
};
// resize图标
const onResize = () => {
  clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    if (dtcsChart.value) {
      dtcsChart.value.resize();
    }
  }, 200);
};
// 清空图标
const clear = () => {
  clearTimeout(timer.value);
  timer.value = null;
  if (dtcsChart.value) {
    dtcsChart.value.dispose();
    dtcsChart.value = null;
  }
  if (props.resizeable) {
    window.removeEventListener("resize", onResize);
  }
};
watch(
  () => props.option,
  (value) => {
    if (dtcsChart.value && value) {
      setTimeout(() => {
        dtcsChart.value.setOption(value, true);
      }, 100);
    } else if (Object.keys(value).length > 0) {
      nextTick(init);
    }
  },
  {
    deep: true,
  }
);
watch(
  () => [props.height, props.width],
  () => {
    onResize();
  }
);
watch(
  () => props.theme,
  () => {
    clear();
    init();
  },
  {
    deep: true,
  }
);
defineExpose({
  resize: () => nextTick(() => dtcsChart.value.resize()),
});
</script>

<style lang="scss" scoped>
.dtcs-chart {
  position: relative;
  // overflow: hidden;
  .container {
    width: 100%;
    height: 100%;
  }
}
</style>
