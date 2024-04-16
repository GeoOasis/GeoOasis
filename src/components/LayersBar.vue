<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLayersBar } from '../composables/useLayersBar';

const { selectedLayer, elementsRef, layersRef, add3dtilesTest } = useLayersBar();

const pointElements = computed(() => {
    // @ts-ignore
    return elementsRef.filter((e) => e.type === 'point');
})
const polylineElements = computed(() => {
    // @ts-ignore
    return elementsRef.filter((e) => e.type === 'polyline');
});

const options = [
    {
        value: 'Bing',
        label: 'Bing'
    },
    {
        value: 'ArcGIS',
        label: 'ArcGIS'
    }
]

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
        <el-select v-model="selectedLayer" placeholder="Select">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="add3dtilesTest">updateLayerList</el-button>
        <el-divider></el-divider>
        <h3>Elements</h3>
        <p class="element" v-for="e in pointElements">{{ e.type }}</p>
        <p class="element" v-for="e in polylineElements">{{ e.type }}</p>
    </div>
</template>

<style scoped>
.layersbar {
    position: fixed;
    left: 30px;
    top: 50%;
    transform: translateY(-50%);

    width: 300px;
    height: calc(100% - 300px);

    background-color: #E1F0DA;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 30px;
}

.element {
    width: 100px;

    border-radius: 5px;
    box-shadow: 0 0 3px;
    padding: 5px;
    margin: 5px;
}
</style>