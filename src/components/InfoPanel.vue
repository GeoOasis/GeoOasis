<script setup lang="ts">
import { Label } from "radix-vue";
import { Icon } from "@iconify/vue";
import Button from "./internals/Button.vue";
import Separator from "./internals/Separator.vue";
import Switch from "./internals/Switch.vue";
import Select from "./internals/Select.vue";
import { useInfoPanel } from "../composables/useInfoPanel";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { storeToRefs } from "pinia";

const store = useGeoOasisStore();
const { isPanelVisible } = storeToRefs(store);

const {
    form,
    selectedElement,
    selectedLayer,
    isToolBoxVisible,
    selectedTool,
    tools,
    isWasm,
    handleElementChange,
    handleExecuteBtn
} = useInfoPanel();
</script>

<template>
    <div class="info-panel" v-show="isPanelVisible">
        <div v-show="selectedElement">
            <div v-for="(value, _index) in form" class="info-panel-item">
                <div v-if="value[0] === 'name'">
                    <Label class="LabelRoot" :for="value[0]">
                        {{ value[0] }}
                    </Label>
                    <input
                        :id="value[0]"
                        class="Input"
                        type="text"
                        :value="value[1]"
                        @change="
                            (e: any) =>
                                handleElementChange({
                                    name: e.target.value
                                })
                        "
                    />
                </div>
                <div v-else-if="value[0] === 'description'">
                    <Label class="LabelRoot" :for="value[0]">
                        {{ value[0] }}
                    </Label>
                    <el-input
                        type="textarea"
                        v-model="value[1]"
                        @change="
                            (value: string) =>
                                handleElementChange({ description: value })
                        "
                    />
                </div>
                <div
                    v-else-if="
                        selectedElement?.type === 'point' &&
                        value[0] === 'color'
                    "
                >
                    <Label class="LabelRoot" :for="value[0]">
                        {{ value[0] }}
                    </Label>
                    <el-color-picker
                        v-model="value[1]"
                        @change="
                            (value: any) =>
                                handleElementChange({ color: value })
                        "
                    />
                </div>
                <div
                    v-else-if="
                        selectedElement?.type === 'point' &&
                        value[0] === 'pixelSize'
                    "
                >
                    <Label class="LabelRoot" :for="value[0]">
                        {{ value[0] }}
                    </Label>
                    <el-input-number
                        v-model="value[1]"
                        :min="1"
                        :max="100"
                        size="small"
                        @change="
                            (cur: number | undefined) =>
                                handleElementChange({ pixelSize: cur })
                        "
                    />
                </div>
            </div>
        </div>
        <div v-show="selectedLayer">
            <div class="info-panel-item">
                <Label class="LabelRoot">name:</Label>
                {{ selectedLayer?.name }}
            </div>
            <div v-if="selectedLayer?.type === 'service'">
                <div class="info-panel-item">
                    <div class="info-panel-toolbar">
                        <Button @click="isToolBoxVisible = !isToolBoxVisible">
                            <Icon
                                icon="material-symbols:settings-outline-rounded"
                            />
                        </Button>
                    </div>
                </div>
            </div>
            <Separator />
            <div v-show="isToolBoxVisible">
                <div class="info-panel-item">
                    <Select
                        title="Tools"
                        :selected="selectedTool"
                        :select-options="tools"
                        @update:model-value="selectedTool = $event"
                    ></Select>
                </div>
                <div class="info-panel-item">
                    <Switch
                        :checked="isWasm"
                        name="wasm mode:"
                        @update:checked="(checked) => (isWasm = checked)"
                    />
                </div>
                <div class="info-panel-item">
                    <Button @click="handleExecuteBtn(selectedTool)">
                        Execute
                        <Icon icon="radix-icons:strikethrough" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-panel {
    position: fixed;
    right: 30px;
    top: 100px;

    width: 250px;

    background-color: var(--grass-1);
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 20px;
}

.info-panel-item {
    margin: 10px 0;
}

.info-panel-toolbar {
    margin: 5px;
    display: flex;
}

/* reset */
input {
    all: unset;
}

.LabelRoot {
    /* margin-right: 10px; */
    font-size: 15px;
    font-weight: 500;
    line-height: 35px;
}

.Input {
    width: 200px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0 10px;
    height: 35px;
    font-size: 15px;
    line-height: 1;
    /* color: white; */
    /* background-color: var(--green-5); */
    box-shadow: 0 0 0 1px var(--green-9);
}
.Input:focus {
    box-shadow: 0 0 0 2px black;
}
.Input::selection {
    background-color: var(--green-9);
    color: white;
}
</style>
