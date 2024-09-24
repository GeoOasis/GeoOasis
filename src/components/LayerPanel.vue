<script setup lang="ts">
import { reactive, watch } from 'vue';
import { storeToRefs } from "pinia";
import { useGeoOasisStore } from "../store/GeoOasis.store";

const store = useGeoOasisStore();
const {selectedLayer} = storeToRefs(store);
const {editor} = store;
</script>

<template>
    <div>
        <div class="layer-panel">
            <span>Layer Name</span>
        </div>
        <div>
            <span>Meta Data</span>
        </div>
        <div>
            <button>热力图分析</button>
        </div>
    </div>
</template>

<style scoped>
.element-panel {
    position: fixed;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);

    background-color: #E1F0DA;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 30px;
}
</style>