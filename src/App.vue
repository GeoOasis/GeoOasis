<script setup lang="ts">
import MapContainer from './components/MapContainer.vue';
import AppHeader from './components/AppHeader.vue';
import FooterBar from './components/FooterBar.vue';
import LayersBar from './components/LayersBar.vue';
</script>

<template>
  <div class="layout-main">
    <MapContainer />
    <AppHeader />
    <LayersBar />
    <FooterBar />
  </div>
</template>

<style scoped>
.layout-main {
  height: 100vh;
  width: 100vw;
}
</style>
