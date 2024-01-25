<script setup lang="ts">
import { useToolsBar } from '../composables/useToolsBar';
import { ref } from 'vue';
const { addLine, addPoint, darwLine, darwLineCallBackProperty } = useToolsBar();
const radio1 = ref('marker');
const items = [{
    label: 'marker',
    icon: 'marker'
}, {
    label: 'polyline',
    icon: 'polyline',
}, {
    label: 'polygon',
    icon: 'polygon',
}];
</script>

<template>
    <div class="toolsbar">
        <el-radio-group v-model="radio1" fill="#99BC85" style="height: 35px;">
            <el-radio-button class="custom-el-radio-button" v-for="item in items" :key="item.label"
                :label="item.label"></el-radio-button>
        </el-radio-group>
        <p> 测试：</p>
        <el-button type="primary" @click="addLine">加线</el-button>
        <el-button type="primary" @click="darwLine">画线</el-button>
        <el-button type="primary" @click="darwLineCallBackProperty">画线callback</el-button>
        <el-button type="danger" @click="addPoint">加点</el-button>
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