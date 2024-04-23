<script setup lang="ts">
import './ToolsBar.css';
import {
    ToolbarButton,
    ToolbarRoot,
    ToolbarSeparator,
    ToolbarToggleGroup,
    ToolbarToggleItem
} from "radix-vue";
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useToolsBar } from '../composables/useToolsBar';
import { useYjs } from "../composables/useYjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";

// for test
const toggleStateMultiple = ref([])

const store = useGeoOasisStore();
const { dialogVisible } = storeToRefs(store);

//@ts-ignore
const { yjsBinding } = useYjs();
const { activeTool } = useToolsBar();
const items = [{
    label: 'default',
    icon: 'gis:arrow-o'
}, {
    label: 'marker',
    icon: 'gis:poi-alt'
}, {
    label: 'point',
    icon: 'gis:point',
}, {
    label: 'polyline',
    icon: 'gis:polyline-pt',
}, {
    label: 'polygon',
    icon: 'gis:polygon-pt',
}, {
    label: 'model',
    icon: 'gis:shape-file'
}];
</script>

<template>
    <ToolbarRoot class="ToolbarRoot">
        <ToolbarToggleGroup v-model="toggleStateMultiple" type="multiple">
            <ToolbarToggleItem class="ToolbarToggleItem" value="point">
                <Icon icon="gis:poi" />
            </ToolbarToggleItem>
            <ToolbarToggleItem class="ToolbarToggleItem" value="strikethrough">
                <Icon icon="radix-icons:strikethrough" />
            </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator class="ToolbarSeparator" />
        <ToolbarToggleGroup v-model="activeTool" type="single">
            <ToolbarToggleItem class="ToolbarToggleItem" v-for="item in items" :value="item.label">
                <Icon :icon="item.icon" />
            </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator class="ToolbarSeparator" />
        <ToolbarButton class="ToolbarButton">
            Upload
            <Icon icon="gis:3dtiles-file" />
        </ToolbarButton>
        <ToolbarButton class="ToolbarButton" style="margin-left: 10px" @click="dialogVisible = true">
            <span>Url</span>
            <Icon icon="gis:search-feature" />
        </ToolbarButton>
        <ToolbarButton class="ToolbarButton" style="margin-left: auto">
            Share
        </ToolbarButton>
    </ToolbarRoot>
</template>
