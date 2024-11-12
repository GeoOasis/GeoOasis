<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Viewer, Ion, Cartesian3, Math } from "cesium";
import { ElNotification } from "element-plus";
import "cesium/Build/CesiumUnminified/Widgets/widgets.css";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { BufferTool } from "../tool/buffer";
import { HeatMapTool } from "../tool/heatmap";

window.CESIUM_BASE_URL = "node_modules/cesium/Build/CesiumUnminified/";

const viewerDivRef = ref<HTMLDivElement>();

const store = useGeoOasisStore();

onMounted(() => {
    Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODYzMmMyOC03YWJjLTRjNzktOTQyMi0yY2ZmMTU4MDA1M2IiLCJpZCI6Njk5NzQsImlhdCI6MTYzMzkzOTkyOH0.jzJQ7ChVpJX_9JqAW2RlpFHxSs8WWzgKA36fnIbX0gU";
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
        shouldAnimate: false
    });
    store.viewerRef.camera.flyTo({
        destination: Cartesian3.fromDegrees(105.0, 20.0, 5000000.0),
        orientation: {
            heading: Math.toRadians(0.0),
            pitch: Math.toRadians(-70),
            roll: 0.0
        }
    });
    store.editor.viewer = store.viewerRef;
    window.cesiumViewer = store.viewerRef;
    store.toolBox.registerTool(new BufferTool());
    store.toolBox.registerTool(new HeatMapTool());

    console.log("Map container mounted");
    ElNotification({
        title: "提示",
        message: "Map container mounted",
        position: 'bottom-right',
        duration: 3000,
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
