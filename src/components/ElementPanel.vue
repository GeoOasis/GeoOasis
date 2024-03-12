<script setup lang="ts">
import { reactive, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useViewerStore } from '../store/viewer-store';

const store = useViewerStore();
const { selectedElement } = storeToRefs(store);
const { editor } = store;


const form = reactive({
    color: 'rgb(255, 255, 255)',
    pixelSize: 1,
    description: '',
})

watch(selectedElement, () => {
    if (selectedElement.value) {
        if (selectedElement.value.type === "point") {
            form.color = selectedElement.value.color;
            form.pixelSize = selectedElement.value.pixelSize;
            form.description = selectedElement.value.description;
        }
    }
})

watch(form, () => {
    if (selectedElement.value) {
        editor.mutateElement(selectedElement.value, form);
        console.log("mutate", form);
    }
})

</script>

<template>
    <div class="element-panel">
        <div class="element-panel-item">
            <span>颜色</span>
            <el-color-picker v-model="form.color" />
        </div>
        <div class="element-panel-item">
            <span>大小</span>
            <el-input-number v-model="form.pixelSize" :min="1" :max="100" />
        </div>
        <div class="element-panel-item">
            <span>描述</span>
            <el-input type="textarea" v-model="form.description"></el-input>
        </div>
    </div>
</template>

<style scoped>
.element-panel {
    position: fixed;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);

    background-color: #E1F0DA;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 30px;
}

.element-panel-item {}
</style>
