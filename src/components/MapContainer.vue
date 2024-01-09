<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Viewer, ImageryLayer, OpenStreetMapImageryProvider } from 'cesium';
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css';

import { useViewerStore } from '../store/viewer-store';

const viewerDivRef = ref<HTMLDivElement>();
window.CESIUM_BASE_URL = 'node_modules/cesium/Build/CesiumUnminified/';
// let viewer: Viewer | null = null;

const viewerStore = useViewerStore();

onMounted(() => {
  viewerStore.viewerRef = new Viewer(viewerDivRef.value as HTMLElement, {
    animation: false,
    baseLayerPicker: true,
    fullscreenButton: false,
    geocoder: false,
    homeButton: true,
    infoBox: true,
    sceneModePicker: true,
    selectionIndicator: true,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    scene3DOnly: false,
    shouldAnimate: false,
    baseLayer: new ImageryLayer(new OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/"
    })
      // imageryProvider: new TileMapServiceImageryProvider({
      //   url: 'node_modules/cesium/Build/CesiumUnminified/Assets/Textures/NaturalEarthII',
      // })
    ),
  });
});
</script>

<template>
  <div id="cesium-viewer" ref="viewerDivRef"></div>
  <slot></slot>
</template>

<style scoped>
#cesium-viewer {
  height: 100%;
  width: 100%;
}
</style>