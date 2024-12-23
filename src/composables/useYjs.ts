import { storeToRefs } from "pinia";
import { useGeoOasisStore } from "../store/GeoOasis.store";

export const useYjs = () => {
    const store = useGeoOasisStore();
    const { editor } = storeToRefs(store);

    const undo = () => {
        editor.value.undoManager.undo();
    };

    const redo = () => {
        editor.value.undoManager.redo();
    };

    return { undo, redo };
};
