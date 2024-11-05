<script setup lang="ts">
import { computed } from "vue";
import { useLayersBar } from "../composables/useLayersBar";
import Button from "./button/Button.vue";

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
        <el-table :data="layersRef" size="small">
            <!-- <el-table-column label="Index" width="50">
                <template #default="scope">
                    <span>{{ scope.row.index }}</span>
                </template>
</el-table-column> -->
            <el-table-column label="LayerName">
                <template #default="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="Operations">
                <template #default="scope">
                    <el-button type="danger" size="small">删除</el-button>
                    <!-- <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                        Delete
                    </el-button> -->
                </template>
            </el-table-column>
        </el-table>
        <el-select v-model="selectedBaseLayer" placeholder="Select">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-select>
        <Button @click="add3dtilesTest">add3dtilesTest</Button>
        <el-divider></el-divider>
        <h3>Elements</h3>
        <div
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
        </div>
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
