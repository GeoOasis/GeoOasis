<script setup lang="ts">
import { onMounted } from 'vue';
import { useCollabBar } from '../composables/useCollabBar';

const { usersList } = useCollabBar();
// 展示avatar等
onMounted(() => {
    console.log("Collab Bar mounted")
})
</script>

<template>
    <div class="collabbar">
        <el-avatar class="avatar" :size="60" v-for="user in usersList" :key="user[0]">{{ user[1].name }}</el-avatar>
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

.avatar {
    background-color: dodgerblue;
}
</style>