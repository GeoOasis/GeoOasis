import { onMounted, watch, ShallowRef } from "vue";
import { storeToRefs } from "pinia";
import * as Y from "yjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { YElement } from "../type";
import { YImageryLayer } from "../editor/imageryLayerManager";
import { TerrainOption } from "../editor/terrain";

export const useLayersBar = () => {
    const store = useGeoOasisStore();
    const {
        selectedTerrain,
        selectedBaseLayer,
        selectedElement,
        selectedLayer,
        elementArray,
        layersArray,
        imageryLayersArray
    } = storeToRefs(store);
    const { editor } = store;

    // mounted
    onMounted(() => {
        console.log("LayersBar mounted");
    });

    watch(selectedBaseLayer, () => {
        editor.setBaseLayer(selectedBaseLayer.value);
    });

    const handleSelect = (id: string) => {
        selectedElement.value = editor.getElement(id);
        selectedLayer.value = editor.getLayer(id);
        // console.log(selectedElement.value, selectedLayer.value);
    };

    const handleDelete = (id: string) => {
        editor.deleteElement(id);
        editor.deleteLayer(id);
        selectedElement.value = undefined;
        selectedLayer.value = undefined;
    };

    const selectTerrain = (terrain: TerrainOption) => {
        editor.setTerrain(terrain);
    }

    return {
        selectedTerrain,
        selectedBaseLayer,
        elementArray: elementArray as ShallowRef<YElement[]>,
        layersArray: layersArray as ShallowRef<Y.Map<any>[]>,
        imageryLayersArray: imageryLayersArray as ShallowRef<YImageryLayer[]>,
        handleSelect,
        handleDelete,
        selectTerrain,
    };
};
