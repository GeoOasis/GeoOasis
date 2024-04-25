<script setup lang="ts">
import BoardBar from './BoardBar.vue';
import ToolsBar from './ToolsBar.vue';
import CollabBar from './CollabBar.vue';
</script>

<template>
    <el-row :gutter="20">
        <el-col :span="5">
            <BoardBar />
        </el-col>
        <el-col :span="14">
            <ToolsBar />
        </el-col>
        <el-col :span="5">
            <CollabBar />
        </el-col>
    </el-row>
</template>

<style scoped>
.el-row {
    position: fixed;
    top: 30px;
    left: 30px;
    right: 30px;
    /* padding: 0 15px; */
}
</style>