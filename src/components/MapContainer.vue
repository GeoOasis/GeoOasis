<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Viewer, ImageryLayer, OpenStreetMapImageryProvider } from 'cesium';
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css';
import { useViewerStore } from '../store/viewer-store';

window.CESIUM_BASE_URL = 'node_modules/cesium/Build/CesiumUnminified/';

const viewerDivRef = ref<HTMLDivElement>();
// let viewer: Viewer | null = null;

const viewerStore = useViewerStore();

onMounted(() => {
  viewerStore.viewerRef = new Viewer(viewerDivRef.value as HTMLElement, {
    animation: false,
    baseLayerPicker: false,
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
    }))
  });
  console.log("Map container mounted")
});
</script>

<template>
  <div id="cesium-viewer" ref="viewerDivRef"></div>
</template>

<style scoped>
#cesium-viewer {
  height: 100%;
  width: 100%;
}
</style>