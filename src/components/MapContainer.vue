<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Viewer, Ion, Terrain } from "cesium";
import { ElNotification } from "element-plus";
import { nanoid } from "nanoid";
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
        baseLayer: false
        // terrain: Terrain.fromWorldTerrain()
    });
    window.cesiumViewer = viewer;
    store.editor.viewer = viewer;
    store.toolBox.registerTool(new BufferTool());
    store.toolBox.registerTool(new HeatMapTool());
    setupBaseLayers();
    flyToHome();
    console.log("Map container mounted");
    ElNotification({
        title: "提示",
        message: "Map container mounted",
        position: "bottom-right",
        duration: 3000
    });
});

const setupBaseLayers = () => {
    store.editor.addBaseLayer(
        {
            id: nanoid(),
            name: "Local",
            type: "imagery",
            provider: "tms",
            show: true,
            url: "cesiumStatic/Assets/Textures/NaturalEarthII"
        },
        true
    );
    store.editor.addBaseLayer(
        {
            id: nanoid(),
            name: "Bing",
            type: "imagery",
            provider: "bing",
            show: true
        },
        true
    );
    store.editor.addBaseLayer(
        {
            id: nanoid(),
            name: "ArcGIS",
            type: "imagery",
            provider: "arcgis",
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
            show: true
        },
        true
    );
};
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
