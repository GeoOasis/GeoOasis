<script setup lang="ts">
import { Label } from "radix-vue";
import Separator from "./internals/Separator.vue";
import Select from "./internals/Select.vue";
import Button from "./internals/Button.vue";
import LayerBarItem from "./LayerBarItem.vue";
import { useLayersBar } from "../composables/useLayersBar";
import { TerrainOption } from "../editor/terrain";

const {
    isTick,
    handleTickBtn,
    selectedTerrain,
    selectedBaseLayer,
    elementArray,
    layersArray,
    imageryLayersArray,
    handleSelect,
    handleDelete,
    selectTerrain
} = useLayersBar();

const baseMapOptions = ["Bing", "ArcGIS", "Local"];
const terrainOptions = Object.values(TerrainOption);
</script>

<template>
    <div class="layersbar">
        <h3>Imagery Layers</h3>
        <Label>BaseLayer:</Label>
        <Select
            title="BaseMap"
            :selected="selectedBaseLayer"
            :select-options="baseMapOptions"
            @update:model-value="selectedBaseLayer = $event"
        ></Select>
        <Separator />
        <Label>Terrain:</Label>
        <Select
            title="Terrain"
            :selected="selectedTerrain"
            :select-options="terrainOptions"
            @update:model-value="selectTerrain($event as TerrainOption)"
        ></Select>
        <LayerBarItem
            type="layer"
            v-for="(e, index) in imageryLayersArray"
            :key="(e.get('id') as string)"
            :index="index"
            :item="e"
            @handle-select="handleSelect"
            @handle-delete="handleDelete"
        />
        <Separator />
        <h3>Other Layers</h3>
        <LayerBarItem
            type="layer"
            v-for="e in layersArray"
            :key="e.get('id')"
            :item="e"
            @handle-select="handleSelect"
            @handle-delete="handleDelete"
        />
        <Separator />
        <h3>Elements</h3>
        <LayerBarItem
            type="element"
            v-for="e in elementArray"
            :key="(e.get('id') as string)"
            :item="e"
            @handle-select="handleSelect"
            @handle-delete="handleDelete"
        />
        <Separator />
        <Button @click="handleTickBtn">{{isTick ? "pause" : "play"}}</Button>
    </div>
</template>

<style scoped>
.layersbar {
    position: fixed;
    left: 30px;
    top: 100px;
    bottom: 50px;

    width: 250px;
    /* height: calc(100% - 300px); */
    overflow-y: auto;

    background-color: var(--grass-1);
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 15px;
}
</style>
