<script setup lang="ts">
import "./CollabBar.css";
import { AvatarFallback, AvatarRoot } from "radix-vue";
import ShareDialog from "./ShareDialog.vue";
import { useSceneHelper } from "../composables/useSceneHelper";
import { useGeoOasisStore } from "../store/GeoOasis.store";

const store = useGeoOasisStore();
const { synOtherUserCamera } = useSceneHelper();
</script>

<template>
    <div class="collabbar">
        <AvatarRoot
            class="AvatarRoot"
            v-for="user in store.userList"
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
