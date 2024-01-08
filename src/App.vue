<script setup lang="ts">
import BoardBar from './components/BoardBar.vue'
import ToolsBar from './components/ToolsBar.vue'
import LayersBar from './components/LayersBar.vue'

</script>

<template>
  <div class="layout-main">
    <div class="layout-container">
      Cesium展示编辑区
    </div>
    <BoardBar />
    <LayersBar />
    <ToolsBar />
  </div>
</template>

<style scoped>
.layout-main {
  background-color: bisque;
  height: 100%;
  width: 100%;
}

</style>
