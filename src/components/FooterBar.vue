<script setup lang="ts">
import { useSceneHelper } from "../composables/useSceneHelper";
const { cursorPosition, flyToHome } = useSceneHelper();
</script>

<template>
    <div class="footerbar">
        <div class="infobar">
            <div class="info">Lng: {{ cursorPosition.lng }}</div>
            <div class="info">Lat: {{ cursorPosition.lat }}</div>
            <div class="info">Height: {{ cursorPosition.height }}</div>
        </div>
        <div class="home" @click="flyToHome">Home</div>
    </div>
</template>

<style scoped>
.footerbar {
    position: fixed;
    bottom: 50px;
    right: 30px;
    background-color: var(--grass-1);
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 0 15px;
    display: flex;
}

.infobar {
    display: flex;
    justify-content: center;
    align-items: center;
}

.info {
    margin: 2px 10px;
    text-align: center;
    pointer-events: none;
}

.home {
    cursor: pointer;
}
</style>
