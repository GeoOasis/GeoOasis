import { defineStore } from "pinia";
import { shallowRef, ref } from "vue";
import { Viewer } from "cesium";
import { Editor } from "../editor/editor";
import { Element } from "../element/element";
import { Layer } from "../layer/layer";
import { ToolBox } from "../tool/ToolBox";

export const useGeoOasisStore = defineStore("viewer", () => {
    // use pinia to store viewer
    const viewerRef = shallowRef<Viewer>({} as Viewer);
    const editor = shallowRef(new Editor());
    const toolBox = shallowRef(new ToolBox());
    const isPanelVisible = ref<Boolean>(false);
    const selectedElement = ref<Element | undefined>();
    const selectedLayer = ref<Layer | undefined>();
    const selectedBaseLayer = ref("Bing");

    const elementState = shallowRef(editor.value.elements.toJSON());
    const layerState = shallowRef(editor.value.layers.toJSON());

    return {
        viewerRef,
        editor,
        toolBox,
        elementState,
        layerState,
        isPanelVisible,
        selectedElement,
        selectedLayer,
        selectedBaseLayer
    };
});
