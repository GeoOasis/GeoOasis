<script setup lang="ts">
import { useToolsBar } from '../composables/useToolsBar';
import { useYjs } from "../composables/useYjs";

import { useGeoOasisStore } from "../store/GeoOasis.store";
import { storeToRefs } from 'pinia';

const store = useGeoOasisStore();
const { dialogVisible } = storeToRefs(store);

//@ts-ignore
const { yjsBinding } = useYjs();
const { activeTool } = useToolsBar();
const items = [{
    label: 'default',
    icon: 'default'
}, {
    label: 'marker',
    icon: 'marker'
}, {
    label: 'point',
    icon: 'point',
}, {
    label: 'polyline',
    icon: 'polyline',
}, {
    label: 'polygon',
    icon: 'polygon',
}, {
    label: 'model',
    icon: 'model'
}];
</script>

<template>
    <div class="toolsbar">
        <el-radio-group v-model="activeTool" fill="#99BC85" style="height: 35px;">
            <el-radio-button class="custom-el-radio-button" v-for="item in items" :key="item.label"
                :label="item.label"></el-radio-button>
        </el-radio-group>
        <el-button type="primary">Upload</el-button>
        <el-button type="primary" @click="dialogVisible = true">Url</el-button>
    </div>
</template>

<style scoped>
.toolsbar {
    background-color: #E1F0DA;
    box-shadow: 0 0 10px;
    border-radius: 5px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>