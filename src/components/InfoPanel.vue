<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import {
    Label,
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectPortal,
    SelectContent,
    SelectScrollUpButton,
    SelectViewport,
    SelectLabel,
    SelectItem,
    SelectItemIndicator,
    SelectItemText
} from "radix-vue";
import Button from "./internals/Button.vue";
import Separator from "./internals/Separator.vue";
import Switch from "./internals/Switch.vue";
import { Icon } from "@iconify/vue";
import "./ToolsBar.css";
import { newImageElement } from "../element/newElement";

const store = useGeoOasisStore();
const { selectedElement, selectedLayer, toolBox } = storeToRefs(store);
const { editor } = store;

const form = reactive({
    color: "rgb(255, 255, 255)",
    pixelSize: 1,
    description: ""
});

const isToolBoxVisible = ref(false);

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

const selectedTool = ref();
const tools = ["buffer", "heatmap", "interplation"];
// part of form
const isWasm = ref(true);

const handleExecuteBtn = (tool: string) => {
    if (!selectedLayer.value) return;
    const geojsonData = editor.getLayerData(selectedLayer.value.id);
    let data: any;
    let option: any; // option应该是是state，而且是动态的
    if (tool === "buffer") {
        option = { mode: "js", size: 100 };
        data = geojsonData;
    } else if (tool === "heatmap") {
        // only for point geojosn
        // prepare data
        const extent = {
            minLng: Infinity,
            minLat: Infinity,
            maxLng: -Infinity,
            maxLat: -Infinity
        };
        data = [];
        geojsonData.features.forEach((feature: any) => {
            const coord = feature.geometry.coordinates;
            extent.minLng = Math.min(extent.minLng, coord[0]);
            extent.minLat = Math.min(extent.minLat, coord[1]);
            extent.maxLng = Math.max(extent.maxLng, coord[0]);
            extent.maxLat = Math.max(extent.maxLat, coord[1]);
            data.push({
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
                heat: feature.properties.heat
            });
        });

        option = {
            size: 256,
            radius: 10,
            maxHeat: 20,
            gradient: ["00AAFF", "00FF00", "FFFF00", "FF8800", "FF0000"],
            extent: extent
        };
        console.log(extent);
    }

    toolBox.value.runTool(tool, data, option).then((result) => {
        // add result to editor
        if (tool === "buffer") {
            editor.addLayer({
                id: nanoid(),
                name: "bufferResult",
                type: "service",
                provider: "geojson",
                url: result as Object,
                show: true
            });
        } else if (tool === "heatmap") {
            const canvas = document.createElement("canvas");
            canvas.width = result.width;
            canvas.height = result.height;
            const ctx = canvas.getContext("2d");
            const bitmap = createImageBitmap(result, {
                imageOrientation: "flipY"
            });
            bitmap.then((bitmap) => {
                ctx?.drawImage(bitmap, 0, 0);
                // canvas.toBlob(
                //     (blob) => {
                //         blob?.arrayBuffer().then((buffer) => {
                //             const imageArr = new Uint8Array(buffer);
                //             const heatmap = newImageElement({
                //                 id: nanoid(),
                //                 type: "image",
                //                 name: "heatMap",
                //                 show: true,
                //                 url: imageArr,
                //                 extent: option.extent
                //             });
                //             editor.addElement(heatmap);
                //         });
                //     },
                //     "image/png",
                //     1.0
                // );
                const pngDataUrl = canvas.toDataURL("image/png", 1.0);
                editor.addLayer({
                    id: nanoid(),
                    name: "heatMap",
                    type: "imagery",
                    provider: "singleTile",
                    show: true,
                    url: pngDataUrl,
                    parameters: {
                        extent: option.extent
                    }
                });
            });
        }
    });
};
</script>

<template>
    <div class="info-panel">
        <div v-show="selectedElement">
            <div v-if="selectedElement?.type === 'point'">
                <div
                    class="info-panel-item"
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
                        />
                    </div>
                </div>
            </div>
        </div>
        <div v-show="selectedLayer">
            <div v-if="selectedLayer?.type === 'service'">
                <Label class="LabelRoot" for="firstName">First name</Label>
                <input
                    id="firstName"
                    class="Input"
                    type="text"
                    value="Pedro Duarte"
                />
                <div>name: {{ selectedLayer.name }}</div>
                <div class="info-panel-toolbar">
                    <Button @click="isToolBoxVisible = !isToolBoxVisible">
                        <Icon icon="gis:globe-gear" />
                    </Button>
                </div>
            </div>
        </div>
        <Separator />
        <div v-show="isToolBoxVisible">
            <SelectRoot v-model="selectedTool">
                <SelectTrigger class="SelectTrigger">
                    <SelectValue placeholder="Select a Tool" />
                    <Icon icon="radix-icons:chevron-down" />
                </SelectTrigger>
                <SelectPortal>
                    <!-- something wrong happend when using style class-->
                    <SelectContent
                        style="
                            overflow: hidden;
                            background-color: white;
                            border-radius: 6px;
                            box-shadow:
                                0px 10px 38px -10px rgba(22, 23, 24, 0.35),
                                0px 10px 20px -15px rgba(22, 23, 24, 0.2);
                        "
                        :side-offset="5"
                    >
                        <SelectScrollUpButton class="SelectScrollButton">
                            <Icon icon="radix-icons:chevron-up" />
                        </SelectScrollUpButton>
                        <SelectViewport class="SelectViewport">
                            <SelectLabel class="SelectLabel">Tools</SelectLabel>
                            <SelectGroup>
                                <SelectItem
                                    v-for="(tool, index) in tools"
                                    :key="index"
                                    :value="tool"
                                    class="SelectItem"
                                >
                                    <SelectItemIndicator
                                        class="SelectItemIndicator"
                                    >
                                        <Icon icon="radix-icons:check" />
                                    </SelectItemIndicator>
                                    <SelectItemText>
                                        {{ tool }}
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
            <Separator />
            <Switch
                :checked="isWasm"
                name="wasm mode:"
                @update:checked="(checked) => (isWasm = checked)"
            />
            <Separator />
            <Button @click="handleExecuteBtn(selectedTool)">
                Execute
                <Icon icon="radix-icons:strikethrough" />
            </Button>
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

.info-panel-toolbar {
    margin: 5px;
    display: flex;
}

/* reset */
/* button {
    all: unset;
} */

.SelectTrigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0 15px;
    font-size: 13px;
    line-height: 1;
    height: 30px;
    gap: 5px;
    background-color: white;
    color: var(--grass-11);
    box-shadow: 0 2px 10px var(--black-a7);
}
.SelectTrigger:hover {
    background-color: var(--mauve-3);
}
.SelectTrigger:focus {
    box-shadow: 0 0 0 2px black;
}
.SelectTrigger[data-placeholder] {
    color: var(--grass-9);
}

.SelectIcon {
    color: Var(--grass-11);
}

.SelectContent {
    overflow: hidden;
    background-color: white;
    border-radius: 6px;
    box-shadow:
        0px 10px 38px -10px rgba(22, 23, 24, 0.35),
        0px 10px 20px -15px rgba(22, 23, 24, 0.2);
}

.SelectViewport {
    padding: 5px;
}

.SelectItem {
    font-size: 13px;
    line-height: 1;
    color: var(--grass-11);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 25px;
    padding: 0 35px 0 25px;
    position: relative;
    user-select: none;
}
.SelectItem[data-disabled] {
    color: var(--mauve-8);
    pointer-events: none;
}
.SelectItem[data-highlighted] {
    outline: none;
    background-color: var(--grass-9);
    color: var(--grass-1);
}

.SelectLabel {
    padding: 0 25px;
    font-size: 12px;
    line-height: 25px;
    color: var(--mauve-11);
}

.SelectSeparator {
    height: 1px;
    background-color: var(--grass-6);
    margin: 5px;
}

.SelectItemIndicator {
    position: absolute;
    left: 0;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.SelectScrollButton {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    background-color: white;
    color: var(--grass-11);
    cursor: default;
}
</style>
