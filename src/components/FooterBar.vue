<script setup lang="ts">
import { useSceneHelper } from "../composables/useSceneHelper";
const { flyToHome } = useSceneHelper();
</script>

<template>
    <div class="footerbar">
        <div @click="flyToHome">Home</div>
    </div>
</template>

<style scoped>
.footerbar {
    position: fixed;
    bottom: 50px;
    right: 30px;
    background-color: #e1f0da;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 0 15px;
}
</style>
