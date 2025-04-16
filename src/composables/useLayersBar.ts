import { watch, ShallowRef, ref } from "vue";
import { storeToRefs } from "pinia";
import * as Y from "yjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { YElement } from "../type";
import { YImageryLayer } from "../editor/imageryLayerManager";
import { createRealTimeHeatmap } from "./real-time-heatmap-analysis";

export const useLayersBar = () => {
    const store = useGeoOasisStore();
    const {
        selectedBaseLayer,
        selectedElement,
        selectedLayer,
        elementArray,
        layersArray,
        imageryLayersArray
    } = storeToRefs(store);
    const { editor } = store;

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

    let control: any;
    const isTick = ref(false);

    const handleTickBtn = () => {
        if (!control) {
            let result = createRealTimeHeatmap(store.editor.viewer!);
            if (result) {
                control = result;
            }
        }

        isTick.value = !isTick.value;
        if (isTick.value) {
            control.start();
        } else {
            control.stop();
        }

        // control.tickOnce();
    };

    return {
        isTick,
        handleTickBtn,
        selectedBaseLayer,
        elementArray: elementArray as ShallowRef<YElement[]>,
        layersArray: layersArray as ShallowRef<Y.Map<any>[]>,
        imageryLayersArray: imageryLayersArray as ShallowRef<YImageryLayer[]>,
        handleSelect,
        handleDelete
    };
};
