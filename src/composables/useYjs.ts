import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useGeoOasisStore } from "../store/GeoOasis.store";

export const useYjs = () => {
    const store = useGeoOasisStore();
    const { elementState, layerState, editor } = storeToRefs(store);

    const elementhandler = () => {
        elementState.value = editor.value.elements.toJSON();
    };

    const layerhandler = () => {
        layerState.value = editor.value.layers.toJSON();
    };

    onMounted(() => {
        console.log("vue state connect to Yjs Doc");
        editor.value.elements.observe(elementhandler);
        editor.value.layers.observe(layerhandler);
    });

    onUnmounted(() => {
        editor.value.elements.unobserve(elementhandler);
        editor.value.layers.unobserve(layerhandler);
    });

    const undo = () => {
        editor.value.undoManager.undo();
    };

    const redo = () => {
        editor.value.undoManager.redo();
    };

    return { elementState, undo, redo };
};
