<script setup lang="ts">
import "./ToolsBar.css";
import {
    ToolbarButton,
    ToolbarRoot,
    ToolbarSeparator,
    ToolbarToggleGroup,
    ToolbarToggleItem
} from "radix-vue";
import ToolbarUploadButton from "./internals/UploadButton.vue";
import Dialog from "./Dialog.vue";
import { Icon } from "@iconify/vue";
import { computed, ref, watch } from "vue";
import { nanoid } from "nanoid";
import { useToolsBar, DrawMode, GizmoMode } from "../composables/useToolsBar";
import { useYjs } from "../composables/useYjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { randomGeoJsonPoint } from "../mock";

const toolOptions = [
    {
        label: "default",
        icon: "gis:arrow-o"
    },
    {
        label: "marker",
        icon: "gis:poi-alt"
    },
    {
        label: "point",
        icon: "gis:point"
    },
    {
        label: "polyline",
        icon: "gis:polyline-pt"
    },
    {
        label: "polygon",
        icon: "gis:polygon-pt"
    },
    {
        label: "model",
        icon: "gis:shape-file"
    }
];
const gizmoModeOptions = [
    {
        label: GizmoMode.TRANSLATE,
        icon: "ant-design:drag-outlined"
    },
    {
        label: GizmoMode.ROTATE,
        icon: "mdi:rotate-360"
    },
    {
        label: GizmoMode.UNIFORM_SCALE,
        icon: "mage:scale-up"
    }
];

const store = useGeoOasisStore();

const { undo, redo } = useYjs();
const {
    activeTool,
    drawMode,
    gizmoMode,
    selectedModelIdx,
    assetsOption,
    handleLoadFile
} = useToolsBar();

const modelBarVisible = computed(() => activeTool.value === "model");

const selectedFile = ref<File>();
watch(selectedFile, () => {
    if (selectedFile.value !== undefined) {
        handleLoadFile(selectedFile.value);
        selectedFile.value = undefined;
    }
});

const mockData = () => {
    const mockData = randomGeoJsonPoint(1000);
    store.editor.addLayer({
        id: nanoid(),
        name: "HeatMapMockData",
        type: "service",
        provider: "geojson",
        show: true,
        url: mockData
    });
};
</script>

<template>
    <ToolbarRoot class="ToolbarRoot">
        <ToolbarToggleGroup
            :model-value="drawMode"
            @update:model-value="
                (val) => {
                    if (val) drawMode = val as DrawMode;
                }
            "
            type="single"
        >
            <ToolbarToggleItem
                class="ToolbarToggleItem"
                :value="DrawMode.SURFACE"
            >
                <Icon icon="gis:layer-alt-poi" />
            </ToolbarToggleItem>
            <ToolbarToggleItem
                class="ToolbarToggleItem"
                :value="DrawMode.SPACE"
            >
                <Icon icon="gis:cube-3d" />
            </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarToggleGroup
            style="margin-left: 6px"
            :model-value="gizmoMode"
            @update:model-value="
                (val) => {
                    if (val) gizmoMode = val as GizmoMode;
                }
            "
            v-show="drawMode === DrawMode.SPACE"
            type="single"
        >
            <ToolbarToggleItem
                class="ToolbarToggleItem"
                v-for="item in gizmoModeOptions"
                :value="item.label"
            >
                <Icon :icon="item.icon" />
            </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator class="ToolbarSeparator" />
        <ToolbarToggleGroup
            v-model="activeTool"
            :disabled="drawMode === DrawMode.SPACE"
            type="single"
        >
            <ToolbarToggleItem
                class="ToolbarToggleItem"
                v-for="item in toolOptions"
                :value="item.label"
            >
                <Icon :icon="item.icon" />
            </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator class="ToolbarSeparator" />
        <ToolbarUploadButton v-model="selectedFile">
            Upload
            <Icon icon="gis:3dtiles-file" />
        </ToolbarUploadButton>
        <Dialog>
            <template #trigger>
                <span>Url</span>
                <Icon icon="gis:search-feature" />
            </template>
        </Dialog>
        <ToolbarButton
            class="ToolbarButton"
            style="margin-left: auto"
            @click="undo"
        >
            Undo
        </ToolbarButton>
        <ToolbarButton
            class="ToolbarButton"
            style="margin-left: 10px"
            @click="redo"
        >
            Redo
        </ToolbarButton>
        <ToolbarButton
            class="ToolbarButton"
            style="margin-left: 10px"
            @click="mockData"
        >
            Mock
        </ToolbarButton>
    </ToolbarRoot>
    <div v-show="modelBarVisible" class="ModelBar">
        <div
            class="ModelBarItem"
            :class="{ ModelBarItemActive: selectedModelIdx === index }"
            v-for="(item, index) in assetsOption"
            @click="selectedModelIdx = index"
        >
            {{ item.name }}
        </div>
    </div>
</template>
