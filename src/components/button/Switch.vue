<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from "radix-vue";
import "./Switch.css";
defineProps<{
    name: string;
    checked: boolean;
}>();

defineEmits<{
    (e: "update:checked", checked: boolean): void;
}>();
</script>

<template>
    <div :style="{ display: 'flex', alignItems: 'center' }">
        <label class="Label" :for="name">{{ name }}</label>
        <SwitchRoot
            :id="name"
            :checked="checked"
            @update:checked="(payload) => $emit('update:checked', payload)"
            class="SwitchRoot"
        >
            <SwitchThumb class="SwitchThumb" />
        </SwitchRoot>
    </div>
</template>

<style lang="css" scoped></style>
