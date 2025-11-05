<!--
 * @Author: zhangzheng
 * @Date: 2025-10-21 17:23:55
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-11-05 17:23:18
 * @Description: 
-->
<template>
  <div class="dash-container-main">
    <slot name="header" />
    <div
      element-loading-background="rgba(0, 0, 0, 0)"
      class="editor-container"
      :loading="loading"
    >
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSlots } from "vue";
const isHeaderSlot = useSlots().header;
const props = defineProps<{
  loading?: boolean;
}>();
</script>
<style lang="scss" scoped>
$drag-overlay-opacity: 0.3;
$header-height: 64px;
.dash-container-main {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.editor-container {
  width: 100%;
  flex: 1;

  &.preview-container {
    opacity: 1;
  }
}
</style>
