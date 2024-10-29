<script setup lang="ts">
import "./CollabBar.css";
import { AvatarFallback, AvatarImage, AvatarRoot } from "radix-vue";
import { onMounted } from "vue";
import { useCollabBar } from "../composables/useCollabBar";

const { usersList } = useCollabBar();
// 展示avatar等
onMounted(() => {
    console.log("Collab Bar mounted");
});
</script>

<template>
    <div class="collabbar">
        <AvatarRoot class="AvatarRoot">
            <AvatarImage
                class="AvatarImage"
                src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                alt="Colm Tuite"
            />
            <AvatarFallback class="AvatarFallback" :delay-ms="600">
                CT
            </AvatarFallback>
        </AvatarRoot>
        <AvatarRoot class="AvatarRoot" v-for="user in usersList" :key="user[0]">
            <AvatarFallback class="AvatarFallback">
                {{ user[1].name }}
            </AvatarFallback>
        </AvatarRoot>
    </div>
</template>
