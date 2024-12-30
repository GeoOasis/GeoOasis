import { onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import * as Y from "yjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { YElement } from "../type";

export const useLayersBar = () => {
    const store = useGeoOasisStore();
    const { selectedBaseLayer, selectedElement, selectedLayer } =
        storeToRefs(store);
    const { editor } = store;

    // mounted
    onMounted(() => {
        console.log("LayersBar mounted");
        editor.viewer?.imageryLayers.layerAdded.addEventListener((e) => {
            console.log("layer added!!!", e);
        });
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

    return {
        selectedBaseLayer,
        elementArray: store.elementArray as YElement[],
        layersArray: store.layersArray as Y.Map<any>[],
        handleSelect,
        handleDelete
    };
};
