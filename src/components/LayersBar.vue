<script setup lang="ts">
import { useLayersBar } from '../composables/useLayersBar';

const { baseLayers, updateLayerList, addEntity } = useLayersBar();
</script>

<template>
    <div class="layersbar">
        <el-table :data="baseLayers" size="small">
            <el-table-column label="Index" width="50">
                <template #default="scope">
                    <span>{{ scope.row.index }}</span>
                </template>
            </el-table-column>
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
        <el-divider></el-divider>
        <el-button type="primary" @click="updateLayerList">updateLayerList</el-button>
        <el-button type="primary" icon="el-icon-edit" @click="addEntity">
            测试
        </el-button>
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

    background-color: skyblue;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 30px;
}
</style>