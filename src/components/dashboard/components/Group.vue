<!--
 * @Author: yuanzengding
 * @Date: 2025-09-26 14:23:38
 * @LastEditors: yuanzengding
 * @LastEditTime: 2025-09-26 16:12:06
 * @Description: 
-->
<template>
  <div
    class="group"
    :style="{
      width: `${props.width}px`,
      height: `${props.height}px`,
    }"
  >
    <Background variant="lines" :gap="10" />
    <!-- <VueFlow v-model="elements" /> -->
  </div>
</template>

<script setup lang="ts">
import { Background } from "@vue-flow/background";
import { useAttrs, ref } from "vue";
// import { VueFlow } from "@vue-flow/core";
// these are our nodes
const elements = ref([]);
const props = defineProps<{
  width: number;
  height: number;
}>();
console.log(useAttrs());
console.log(props);
</script>

<style lang="scss" scoped>
.group {
  background: black;
}
</style>
