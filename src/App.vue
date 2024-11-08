<script setup lang="ts">
import MapContainer from "./components/MapContainer.vue";
import AppHeader from "./components/AppHeader.vue";
import FooterBar from "./components/FooterBar.vue";
import LayersBar from "./components/LayersBar.vue";
import InfoPanel from "./components/InfoPanel.vue";
import { useGeoOasisStore } from "./store/GeoOasis.store";
import { storeToRefs } from "pinia";

const store = useGeoOasisStore();
const { isPanelVisible } = storeToRefs(store);
</script>

<template>
    <div class="layout-main">
        <MapContainer />
        <AppHeader />
        <LayersBar />
        <FooterBar />
        <InfoPanel v-show="isPanelVisible" />
    </div>
</template>

<style scoped>
.layout-main {
    height: 100vh;
    width: 100vw;
}
</style>
