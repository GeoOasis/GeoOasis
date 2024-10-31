<script setup lang="ts">
import { reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useGeoOasisStore } from "../store/GeoOasis.store";

const store = useGeoOasisStore();
const { selectedElement, selectedLayer } = storeToRefs(store);
const { editor } = store;

const form = reactive({
    color: "rgb(255, 255, 255)",
    pixelSize: 1,
    description: ""
});

watch(selectedElement, () => {
    if (selectedElement.value) {
        if (selectedElement.value.type === "point") {
            form.color = selectedElement.value.color;
            form.pixelSize = selectedElement.value.pixelSize;
            form.description = selectedElement.value.description;
        }
    }
});

const handleElementChange = (update: { [key: string]: any }) => {
    if (selectedElement.value) {
        editor.mutateElement(selectedElement.value.id, update);
    }
};
</script>

<template>
    <div class="element-panel">
        <div v-show="selectedElement">
            <div v-if="selectedElement?.type === 'point'">
                <div
                    class="element-panel-item"
                    v-for="(value, key, index) in selectedElement"
                >
                    <div v-if="key === 'name'">
                        {{ key }}: {{ value.toString() }}
                    </div>
                    <div v-else-if="key === 'color'">
                        <span>{{ key }}</span>
                        <el-color-picker
                            v-model="form.color"
                            @change="
                                (value: any) =>
                                    handleElementChange({ color: value })
                            "
                        />
                    </div>
                    <div v-else-if="key === 'pixelSize'">
                        <span>{{ key }}</span>
                        <el-input-number
                            v-model="form.pixelSize"
                            :min="1"
                            :max="100"
                            @change="
                                (value: number) =>
                                    handleElementChange({ pixelSize: value })
                            "
                        />
                    </div>
                    <div v-else-if="key === 'description'">
                        <span>{{ key }}</span>
                        <el-input
                            type="textarea"
                            v-model="form.description"
                            @change="
                                (value: string) =>
                                    handleElementChange({ description: value })
                            "
                        ></el-input>
                    </div>
                </div>
            </div>
        </div>
        <div v-show="selectedLayer">
            Select a Layer:{{ selectedLayer?.name }}
        </div>
    </div>
</template>

<style scoped>
.element-panel {
    position: fixed;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);

    background-color: var(--grass-1);
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 30px;
}
</style>
