<script setup lang="ts">
import Button from "./internals/Button.vue";
import Separator from "./internals/Separator.vue";
import { computed } from "vue";
import { useLayersBar } from "../composables/useLayersBar";

const {
    selectedBaseLayer,
    elementsRef,
    layersRef,
    add3dtilesTest,
    handleSelect
} = useLayersBar();

const pointElements = computed(() => {
    return elementsRef.value.filter((e) => e.type === "point");
});
const polylineElements = computed(() => {
    return elementsRef.value.filter((e) => e.type === "polyline");
});

const options = [
    {
        value: "Bing",
        label: "Bing"
    },
    {
        value: "ArcGIS",
        label: "ArcGIS"
    }
];
</script>

<template>
    <div class="layersbar">
        <h3>Layers</h3>
        <div class="element" v-for="e in layersRef">
            id: {{ e.id.slice(0, 3) }}, type: {{ e.type }}
        </div>
        <Separator />
        <p>BaseMap</p>
        <el-select v-model="selectedBaseLayer" placeholder="Select">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-select>
        <Separator />
        <Button @click="add3dtilesTest">add3dtilesTest</Button>
        <h3>Elements</h3>
        <div
            class="element"
            v-for="e in elementsRef"
            @click="handleSelect(e.id)"
        >
            id: {{ e.id.slice(0, 3) }}, type: {{ e.type }}
        </div>
        <!-- <div
            class="element"
            v-for="e in pointElements"
            @click="handleSelect(e.id)"
        >
            id: {{ e.id.slice(0, 3) }}, type: {{ e.type }}
        </div>
        <div
            class="element"
            v-for="e in polylineElements"
            @click="handleSelect(e.id)"
        >
            id: {{ e.id.slice(0, 3) }}, type:
            {{ e.type }}
        </div> -->
    </div>
</template>

<style scoped>
.layersbar {
    position: fixed;
    left: 30px;
    top: 100px;

    width: 250px;
    height: calc(100% - 300px);
    overflow-y: auto;

    background-color: var(--grass-1);
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 15px;
}

.element {
    border-radius: 5px;
    box-shadow: 0 0 2px;
    padding: 5px;
    margin: 5px;
    user-select: none;
}

.element:hover {
    background-color: var(--grass-4);
}
</style>
