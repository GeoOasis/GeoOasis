<script setup lang="ts">
import Button from "./internals/Button.vue";
import Separator from "./internals/Separator.vue";
import Select from "./internals/Select.vue";
import Item from "./LayerBarItem.vue";
import { useLayersBar } from "../composables/useLayersBar";
import * as Y from "yjs";

const {
    selectedBaseLayer,
    elementArray,
    layersArray,
    add3dtilesTest,
    handleSelect,
    handleDelete
} = useLayersBar();

const baseMapOptions = ["Bing", "ArcGIS", "Local"];
</script>

<template>
    <div class="layersbar">
        <h3>Layers</h3>
        <Item
            type="layer"
            v-for="e in layersArray"
            :key="e.get('id')"
            :item="e as Y.Map<any>"
            @handle-select="handleSelect"
            @handle-delete="handleDelete"
        />
        <Separator />
        <Select
            title="BaseMap"
            :selected="selectedBaseLayer"
            :select-options="baseMapOptions"
            @update:model-value="selectedBaseLayer = $event"
        ></Select>
        <Separator />
        <Button @click="add3dtilesTest">add3dtilesTest</Button>
        <h3>Elements</h3>
        <Item
            type="element"
            v-for="e in elementArray"
            :key="e.get('id')"
            :item="e as Y.Map<any>"
            @handle-select="handleSelect"
            @handle-delete="handleDelete"
        />
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
