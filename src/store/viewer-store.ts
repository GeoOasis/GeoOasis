import { defineStore } from "pinia";
import { shallowRef, ref } from "vue";
import { Viewer } from "cesium";
import { Editor } from "../editor/editor";
import { Element } from "../element/element";

export const useViewerStore = defineStore("viewer", () => {
    // use pinia to store viewer
    // 这里使用了断言，所以后续代码不会出现undefined
    const viewerRef = shallowRef<Viewer>({} as Viewer);
    const editor = new Editor();
    const isElementPanel = ref<Boolean>(false);
    const selectedElement = ref<Element | undefined>();

    return {
        viewerRef,
        editor,
        isElementPanel,
        selectedElement
    };
});
