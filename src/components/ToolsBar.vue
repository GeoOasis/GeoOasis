<script setup lang="ts">
// 展示工具栏，笔刷这些
</script>

<template>
    <div class="toolsbar">
        <el-button v-for="i in 7" :key="i" type="primary" circle>{{ i }}</el-button>
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