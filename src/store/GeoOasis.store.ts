import { defineStore } from "pinia";
import { shallowRef, ref, computed } from "vue";
import { useAwareness } from "../composables/useAwareness";
import { useSyncArray, useSyncMapArray } from "../composables/useSync";
import { Editor } from "../editor/editor";
import { Element } from "../element/element";
import { Layer } from "../layer/layer";
import { ToolBox } from "../tool/ToolBox";

export const useGeoOasisStore = defineStore("viewer", () => {
    const editor = shallowRef(new Editor());
    const toolBox = shallowRef(new ToolBox());
    const selectedElement = ref<Element | undefined>();
    const selectedLayer = ref<Layer | undefined>();
    const selectedBaseLayer = ref("Local");
    const isPanelVisible = computed(() =>
        selectedElement.value || selectedLayer.value ? true : false
    );

    const elementArray = useSyncMapArray(editor.value.elements);
    const layersArray = useSyncMapArray(editor.value.layers);
    const assetState = useSyncArray(editor.value.assetLibrary.assetArray);

    const roomId = ref("");
    const { userList, setUser, setUserPostion } = useAwareness(
        editor.value,
        roomId
    );

    return {
        editor,
        toolBox,
        elementArray,
        layersArray,
        assetState,
        isPanelVisible,
        selectedElement,
        selectedLayer,
        selectedBaseLayer,
        userList,
        roomId,
        setUser,
        setUserPostion
    };
});
