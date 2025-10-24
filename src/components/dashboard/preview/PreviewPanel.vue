<!--
 * @Author: zhangzheng
 * @Date: 2025-10-16 14:32:45
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-17 10:27:35
 * @Description: 
-->
<template>
  <div class="preview-panel"></div>
</template>

<style lang="scss">
.preview-panel {
  background-size: 100% 100% !important;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  div::-webkit-scrollbar {
    width: 0px !important;
    height: 0px !important;
  }
  div {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
}
</style>
