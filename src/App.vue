<script setup lang="ts">
import MapContainer from './components/MapContainer.vue';
import AppHeader from './components/AppHeader.vue';
import FooterBar from './components/FooterBar.vue';
import LayersBar from './components/LayersBar.vue';
import ElementPanel from './components/ElementPanel.vue';
import { useViewerStore } from './store/viewer-store';
import { storeToRefs } from 'pinia';

const store = useViewerStore();
const { isElementPanel } = storeToRefs(store);

</script>

<template>
  <div class="layout-main">
    <MapContainer />
    <AppHeader />
    <LayersBar />
    <FooterBar />
    <ElementPanel v-show="isElementPanel" />
  </div>
</template>

<style scoped>
.layout-main {
  height: 100vh;
  width: 100vw;
}
</style>
