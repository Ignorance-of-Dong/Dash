<!--
 * @Author: zhangzheng
 * @Date: 2025-10-20 18:40:36
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-21 10:48:32
 * @Description: 
-->
<template>
  <div class="preview-panel" ref="previewPanelRef">
    <div
      class="component-wrapper"
      v-for="item in componentData"
      :key="item.id"
      :style="getShapeItemStyleForComponent(item)"
    >
      <component
        :is="item.component"
        :class="item.component"
        class="component"
        :style="getComponentStyle(item.style)"
        :prop-value="item.propValue"
        :type="item.type"
        :element="item"
        :id="item.id"
        :key="item.key"
        :disabled="true"
        :componentId="item.componentId"
        v-model:editor="item.context"
        v-model:imageSrc="item.imageSrc"
        v-model:thermal="item.thermalData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useEditorDataStore } from "../store/editorData";
import { getShapeItemStyle } from "../utils/style";
import { clone } from "ramda";

const editorDataStore = useEditorDataStore();
const previewPanelRef = ref<HTMLElement | null>(null);
const componentData = computed(() => editorDataStore.componentData);
const canvasStyleData = computed(() => editorDataStore.canvasStyleData);

const getComponentStyle = (style: any) => {
  console.log({
    transform: `scale(${widthScale.value}, ${heightScale.value})`,
  });

  return {
    transform: `scale(${widthScale.value}, ${heightScale.value})`,
  };
};

const widthScale = ref<number>(100);
const heightScale = ref<number>(100);
onMounted(() => {
  // 计算当前previewPanelRef基于canvas的缩放比例，保留 4 位小数
  if (previewPanelRef.value) {
    widthScale.value = Number(
      Number(
        previewPanelRef.value.getBoundingClientRect().width /
          editorDataStore.canvasStyleData.width
      ).toFixed(4)
    );
    heightScale.value = Number(
      Number(
        previewPanelRef.value.getBoundingClientRect().height /
          editorDataStore.canvasStyleData.height
      ).toFixed(4)
    );
    console.log(
      widthScale.value,
      heightScale.value,
      canvasStyleData.value.scale
    );
  }
});

const getShapeItemStyleForComponent = (componentItem) => {
  const componentClone = clone(componentItem);
  //  真实宽度
  const diffScale = 1 - canvasStyleData.value.scale / 100;
  console.log(diffScale);

  const widthDiff = componentClone.style.width * diffScale;
  const heightDiff = componentClone.style.height * diffScale;
  const leftDiff = componentClone.style.left * diffScale;
  const topDiff = componentClone.style.top * diffScale;
  console.log(widthDiff, heightDiff, leftDiff, topDiff);
  componentClone.style.width =
    (componentClone.style.width + widthDiff) * widthScale.value;
  componentClone.style.height =
    (componentClone.style.height + heightDiff) * heightScale.value;
  componentClone.style.left =
    (componentClone.style.left + leftDiff) * widthScale.value;
  componentClone.style.top =
    (componentClone.style.top + topDiff) * heightScale.value;

  console.log(componentClone.style);
  return getShapeItemStyle(componentClone);
};
</script>

<style lang="scss" scoped>
.preview-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  z-index: 99999;
  .component-wrapper {
    position: absolute;
  }
}
</style>
