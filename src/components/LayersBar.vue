<script setup lang="ts">
import {Cartesian3, Color, Entity} from 'cesium'
import { useViewerStore } from '../store/viewer-store'; 
import { storeToRefs } from 'pinia';
const viewerStore = useViewerStore();
const { viewerRef } = storeToRefs(viewerStore);
const addEntity = () => {
    // @ts-ignore
    const wyoming: Entity = viewerStore.viewerRef.entities.add({
        polygon: {
            hierarchy: Cartesian3.fromDegreesArray([
            -109.080842, 45.002073, -105.91517, 45.002073, -104.058488, 44.996596,
            -104.053011, 43.002989, -104.053011, 41.003906, -105.728954, 40.998429,
            -107.919731, 41.003906, -109.04798, 40.998429, -111.047063, 40.998429,
            -111.047063, 42.000709, -111.047063, 44.476286, -111.05254, 45.002073,
            ]),
            height: 0,
            material: Color.RED.withAlpha(0.5),
            outline: true,
            outlineColor: Color.BLACK,
        },
    });
    // viewerStore.viewerRef?.flyTo(wyoming);
    viewerRef.value?.flyTo(wyoming);
}

</script>

<template>
    <div class="layersbar">
        <ul>
            <li>layer1</li>
            <li>layer2</li>
            <li>layer3</li>
        </ul>
        <el-button type="primary" icon="el-icon-edit" @click="addEntity">测试</el-button>
    </div>
</template>

<style scoped>
.layersbar {
    position: fixed;
    left: 30px;
    top: 50%;
    transform: translateY(-50%);

    width: 200px;
    height: calc(100% - 300px);

    background-color: skyblue;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 30px;
}
</style>