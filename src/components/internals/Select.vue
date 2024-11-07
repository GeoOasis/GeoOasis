<script setup lang="ts">
import {
    SelectRoot,
    SelectTrigger,
    SelectGroup,
    SelectValue,
    SelectPortal,
    SelectContent,
    SelectScrollUpButton,
    SelectScrollDownButton,
    SelectViewport,
    SelectLabel,
    SelectItem,
    SelectItemIndicator,
    SelectItemText
} from "radix-vue";
import { Icon } from "@iconify/vue";
import "./Select.css";
defineProps<{
    title: string;
    selected: string;
    selectOptions: string[];
}>();

defineEmits<{
    (e: "update:model-value", selected: string): void;
}>();
</script>

<template>
    <SelectRoot
        :model-value="selected"
        @update:model-value="$emit('update:model-value', $event)"
    >
        <SelectTrigger class="SelectTrigger">
            <SelectValue placeholder="Select a Tool" />
            <Icon icon="radix-icons:chevron-down" />
        </SelectTrigger>
        <SelectPortal>
            <SelectContent class="SelectContent" :side-offset="5">
                <SelectScrollUpButton class="SelectScrollButton">
                    <Icon icon="radix-icons:chevron-up" />
                </SelectScrollUpButton>
                <SelectViewport class="SelectViewport">
                    <SelectLabel class="SelectLabel">{{ title }}</SelectLabel>
                    <SelectGroup>
                        <SelectItem
                            v-for="(option, index) in selectOptions"
                            :key="index"
                            :value="option"
                            class="SelectItem"
                        >
                            <SelectItemIndicator class="SelectItemIndicator">
                                <Icon icon="radix-icons:check" />
                            </SelectItemIndicator>
                            <SelectItemText>
                                {{ option }}
                            </SelectItemText>
                        </SelectItem>
                    </SelectGroup>
                </SelectViewport>
                <SelectScrollDownButton class="SelectScrollButton">
                    <Icon icon="radix-icons:chevron-down" />
                </SelectScrollDownButton>
            </SelectContent>
        </SelectPortal>
    </SelectRoot>
</template>
