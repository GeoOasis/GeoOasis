<script setup lang="ts">
import { useToolsBar } from '../composables/useToolsBar';
const { addLine, addPoint, darwLine, darwLineCallBackProperty } = useToolsBar();
</script>

<template>
    <div class="toolsbar">
        <el-button type="primary" @click="addLine">加线</el-button>
        <el-button type="primary" @click="darwLine">画线</el-button>
        <el-button type="primary" @click="darwLineCallBackProperty">画线callback</el-button>
        <el-button type="danger" @click="addPoint">加点</el-button>
        <el-button v-for="i in 5" :key="i" type="primary" circle>{{ i }}</el-button>
    </div>
</template>

<style scoped>
.toolsbar {
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    /* background-color: gray; */
    background-color: skyblue;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 0 15px;
}
</style>