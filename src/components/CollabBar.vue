<script setup lang="ts">
import { onMounted } from 'vue';
// 展示avatar等
onMounted(() => {
    console.log("Collab Bar mounted")
})
</script>

<template>
    <div class="collabbar">
        <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
    </div>
</template>

<style scoped>
.collabbar {
    position: fixed;
    top: 60px;
    right: 30px;
    /* background-color: gray; */
    background-color: skyblue;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 0 15px;
}
</style>