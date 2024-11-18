<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Button from "./internals/Button.vue";
import Separator from "./internals/Separator.vue";
import Select from "./internals/Select.vue";
import { computed } from "vue";
import { useLayersBar } from "../composables/useLayersBar";

const {
    selectedBaseLayer,
    elementsRef,
    layersRef,
    add3dtilesTest,
    handleSelect,
    handleDelete
} = useLayersBar();

const pointElements = computed(() => {
    return elementsRef.value.filter((e) => e.type === "point");
});
const polylineElements = computed(() => {
    return elementsRef.value.filter((e) => e.type === "polyline");
});

const baseMapOptions = ["Bing", "ArcGIS", "Local"];
</script>

<template>
    <div class="layersbar">
        <h3>Layers</h3>
        <div class="item" v-for="e in layersRef" @click="handleSelect(e.id)">
            id: {{ e.id.slice(0, 3) }}, type: {{ e.type }}
            <Button @click.stop="handleDelete(e.id)">
                <Icon icon="ic:baseline-delete" />
            </Button>
        </div>
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
        <div class="item" v-for="e in elementsRef" @click="handleSelect(e.id)">
            id: {{ e.id.slice(0, 3) }}, type: {{ e.type }}
            <Button @click.stop="handleDelete(e.id)">
                <Icon icon="ic:baseline-delete" />
            </Button>
        </div>
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

.item {
    border-radius: 5px;
    box-shadow: 0 0 2px;
    padding: 5px;
    margin: 5px;
    user-select: none;

    display: flex;
    align-items: center;
    justify-content: space-around;
}

.item:hover {
    background-color: var(--grass-4);
}
</style>
