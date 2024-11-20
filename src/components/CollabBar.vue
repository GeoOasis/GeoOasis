<script setup lang="ts">
import "./CollabBar.css";
import { AvatarFallback, AvatarRoot } from "radix-vue";
import ShareDialog from "./ShareDialog.vue";
import { onMounted } from "vue";
import { useCollabBar } from "../composables/useCollabBar";

const { userList, synOtherUserCamera } = useCollabBar();

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

        <ShareDialog>
            <template #trigger>
                <span>Share</span>
            </template>
        </ShareDialog>
    </div>
</template>
