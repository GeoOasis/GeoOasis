<script setup lang="ts">
import BoardBar from './components/BoardBar.vue';
import ToolsBar from './components/ToolsBar.vue';
import LayersBar from './components/LayersBar.vue';
import CollabBar from './components/CollabBar.vue';
import FooterBar from './components/FooterBar.vue';
import MapContainer from './components/MapContainer.vue';

</script>

<template>
  <div class="layout-main">
    <map-container>
      <CollabBar />
      <BoardBar />
      <LayersBar />
      <ToolsBar />
      <FooterBar />
    </map-container>
  </div>
</template>

<style scoped>
.layout-main {
  background-color: bisque;
  height: 100%;
  width: 100%;
}
</style>
