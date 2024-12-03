<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Viewer, Ion, Cartesian3, Math, Terrain } from "cesium";
import { ElNotification } from "element-plus";
import "cesium/Build/CesiumUnminified/Widgets/widgets.css";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { useSceneHelper } from "../composables/useSceneHelper";
import { BufferTool } from "../tool/buffer";
import { HeatMapTool } from "../tool/heatmap";
import { CesiumIonDefaultToken } from "../contants";

const viewerDivRef = ref<HTMLDivElement>();

const store = useGeoOasisStore();
const { flyToHome } = useSceneHelper();

onMounted(() => {
    Ion.defaultAccessToken = CesiumIonDefaultToken;
    const viewer = new Viewer(viewerDivRef.value as HTMLElement, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: true,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: false,
        shouldAnimate: false,
        terrain: Terrain.fromWorldTerrain()
    });
    viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(105.0, 20.0, 5000000.0),
        orientation: {
            heading: Math.toRadians(0.0),
            pitch: Math.toRadians(-70),
            roll: 0.0
        }
    });
    window.cesiumViewer = viewer;
    store.viewerRef = viewer;
    store.editor.viewer = viewer;
    store.toolBox.registerTool(new BufferTool());
    store.toolBox.registerTool(new HeatMapTool());
    console.log("Map container mounted");
    flyToHome();
    ElNotification({
        title: "提示",
        message: "Map container mounted",
        position: "bottom-right",
        duration: 3000
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
