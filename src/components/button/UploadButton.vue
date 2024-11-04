<script setup lang="ts">
import Button from "./Button.vue";
import { ref } from "vue";

const emit = defineEmits<{
    (e: "update:modelValue", file: File): void;
}>();

const uploadRef = ref<HTMLInputElement>();
const handleUploadBtn = () => {
    uploadRef.value?.click();
};

const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
        emit("update:modelValue", files[0]);
    }
};
</script>

<template>
    <Button @click="handleUploadBtn">
        <slot></slot>
        <input
            ref="uploadRef"
            type="file"
            @change="handleChange"
            style="display: none"
        />
    </Button>
</template>
