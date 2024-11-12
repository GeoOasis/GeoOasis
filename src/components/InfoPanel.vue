<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { Label } from "radix-vue";
import { Icon } from "@iconify/vue";
import Button from "./internals/Button.vue";
import Separator from "./internals/Separator.vue";
import Switch from "./internals/Switch.vue";
import Select from "./internals/Select.vue";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { newImageElement } from "../element/newElement";

const store = useGeoOasisStore();
const { selectedElement, selectedLayer, toolBox } = storeToRefs(store);
const { editor } = store;

const form = ref<any[]>([]);

watch(selectedElement, () => {
    form.value = [];
    if (selectedElement.value) {
        for (const [key, value] of Object.entries(selectedElement.value)) {
            form.value.push([key, value]);
        }
    }
});

const handleElementChange = (update: { [key: string]: any }) => {
    if (selectedElement.value) {
        editor.mutateElement(selectedElement.value.id, update);
    }
};

const isToolBoxVisible = ref(false);
const selectedTool = ref();
const tools = ["buffer", "heatmap", "interplation"];
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
            <div v-for="(value, index) in form" class="info-panel-item">
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
                            (value: number) =>
                                handleElementChange({ pixelSize: value })
                        "
                    />
                </div>
            </div>
        </div>
        <div v-show="selectedLayer">
            <div v-if="selectedLayer?.type === 'service'">
                <div class="info-panel-item">
                    <Label class="LabelRoot">name:</Label>
                    {{ selectedLayer.name }}
                </div>
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
