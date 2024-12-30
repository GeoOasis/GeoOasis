<script setup lang="ts">
import "cesium/Build/CesiumUnminified/Widgets/widgets.css";
import { useSetup } from "../composables/useSetup";

const { viewerDivRef } = useSetup();
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
