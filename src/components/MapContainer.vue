<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Viewer, Ion } from 'cesium';
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css';
import { useGeoOasisStore } from '../store/GeoOasis.store';
import { ElNotification } from 'element-plus';

window.CESIUM_BASE_URL = 'node_modules/cesium/Build/CesiumUnminified/';

const viewerDivRef = ref<HTMLDivElement>();
// let viewer: Viewer | null = null;

const store = useGeoOasisStore();

onMounted(() => {
  Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODYzMmMyOC03YWJjLTRjNzktOTQyMi0yY2ZmMTU4MDA1M2IiLCJpZCI6Njk5NzQsImlhdCI6MTYzMzkzOTkyOH0.jzJQ7ChVpJX_9JqAW2RlpFHxSs8WWzgKA36fnIbX0gU';
  store.viewerRef = new Viewer(viewerDivRef.value as HTMLElement, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: true,
    infoBox: false,
    sceneModePicker: true,
    selectionIndicator: true,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    scene3DOnly: false,
    shouldAnimate: false,
  });
  store.editor.viewer = store.viewerRef;
  console.log("Map container mounted")
  // For test
  ElNotification({
    title: '提示',
    message: "Map container mounted",
  });
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