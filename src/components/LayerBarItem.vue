<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Button from "./internals/Button.vue";
import * as Y from "yjs";
import { useSyncMap } from "../composables/useSync";
import { ElementKV } from "../element/element";
import { LayerKV } from "../layer/layer";

const props = defineProps<{
    type: "element" | "layer";
    item: Y.Map<any>;
}>();

const emit = defineEmits<{
    handleSelect: [id: string];
    handleDelete: [id: string];
}>();

const itemMap = useSyncMap<ElementKV | LayerKV>(props.item, [
    "id",
    "name",
    "type"
]);
</script>

<template>
    <div class="item" @click="emit('handleSelect', itemMap.id.value)">
        name: {{ itemMap.name.value }},type: {{ itemMap.type.value }}
        <Button @click.stop="emit('handleDelete', itemMap.id.value)">
            <Icon icon="ic:baseline-delete" />
        </Button>
    </div>
</template>

<style scoped>
.item {
    border-radius: 5px;
    box-shadow: 0 0 2px;
    padding: 5px;
    margin: 5px;
    user-select: none;

    display: flex;
    align-items: center;
    justify-content: space-around;
}

.item:hover {
    background-color: var(--grass-4);
}
</style>
