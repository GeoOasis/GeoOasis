import { defineStore } from "pinia";
import { shallowRef, ref } from "vue";
import { Viewer } from "cesium";
import { Editor } from "../editor/editor";
import { Element } from "../element/element";
import { GeoOasisLayer } from "../layer/layer";

export const useGeoOasisStore = defineStore("viewer", () => {
    // use pinia to store viewer
    const viewerRef = shallowRef<Viewer>({} as Viewer);
    const editor = new Editor();
    const isElementPanel = ref<Boolean>(false);
    const selectedElement = ref<Element | undefined>();
    const selectedLayer = ref<GeoOasisLayer | undefined>();
    const selectedBaseLayer = ref("Bing");
    const dialogVisible = ref(false);

    return {
        viewerRef,
        editor,
        isElementPanel,
        selectedElement,
        selectedLayer,
        selectedBaseLayer,
        dialogVisible
    };
});
