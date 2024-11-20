import { defineStore } from "pinia";
import { shallowRef, ref, computed } from "vue";
import { Viewer } from "cesium";
import { useAwareness } from "../composables/useAwareness";
import { Editor } from "../editor/editor";
import { Element } from "../element/element";
import { Layer } from "../layer/layer";
import { ToolBox } from "../tool/ToolBox";

export const useGeoOasisStore = defineStore("viewer", () => {
    // use pinia to store viewer
    const viewerRef = shallowRef<Viewer>({} as Viewer);
    const editor = shallowRef(new Editor());
    const toolBox = shallowRef(new ToolBox());
    const selectedElement = ref<Element | undefined>();
    const selectedLayer = ref<Layer | undefined>();
    const selectedBaseLayer = ref("Bing");
    const isPanelVisible = computed(() =>
        selectedElement.value || selectedLayer.value ? true : false
    );

    const elementState = shallowRef(editor.value.elements.toJSON());
    const layerState = shallowRef(editor.value.layers.toJSON());

    const roomId = ref("");
    const { userList, setUser, setUserPostion } = useAwareness(
        editor.value,
        roomId
    );

    return {
        viewerRef,
        editor,
        toolBox,
        elementState,
        layerState,
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
