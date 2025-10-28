<!--
 * @Author: zhangzheng
 * @Date: 2025-09-29 14:57:20
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-28 10:49:28
 * @Description: 
-->
<template>
  <div
    class="dash-editor-header-main"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="dash-editor-header-name" draggable="true" data-id="TestRect">
      <TestRect />
    </div>
    <el-button type="primary" @click="handlePreview">预览</el-button>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { useEditorDataStore } from "./store/editorData";

const editorDataStore = useEditorDataStore();

const emit = defineEmits<{
  (e: "preview"): void;
}>();
const handleDragStart = (e: DragEvent) => {
  e && e.dataTransfer && e.dataTransfer.setData("id", "TestRect");
  editorDataStore.setDragStatus("dragIn");
};

const handlePreview = () => {
  emit("preview");
};

const handleDragEnd = () => {
  editorDataStore.setDragStatus("dragOut");
};
</script>

<style>
.dash-editor-header-main {
  height: 64px;
  display: flex;
  background-color: #ccc;
  position: relative;
  overflow: hidden;
  .dash-editor-header-name {
    color: #fff;
    border: 1px solid #fff;
    padding: 10px;
    width: 100px;
    height: 100px;
    background-color: #fff;
  }
}
</style>
