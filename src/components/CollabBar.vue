<script setup lang="ts">
import "./CollabBar.css";
import { AvatarFallback, AvatarRoot } from "radix-vue";
import { onMounted } from "vue";
import { useCollabBar } from "../composables/useCollabBar";

const { userList, synOtherUserCamera } = useCollabBar();
// 展示avatar等
onMounted(() => {
    console.log("Collab Bar mounted");
});
</script>

<template>
    <div class="collabbar">
        <AvatarRoot
            class="AvatarRoot"
            v-for="user in userList"
            :key="user.id"
            @click="synOtherUserCamera(user)"
        >
            <AvatarFallback class="AvatarFallback">
                {{ user.name }}
            </AvatarFallback>
        </AvatarRoot>
    </div>
</template>
