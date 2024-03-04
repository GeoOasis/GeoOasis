import { defineStore } from "pinia";
import { shallowRef } from "vue";
import { Viewer } from "cesium";
import { Editor } from "../editor/editor";

export const useViewerStore = defineStore("viewer", () => {
    // use pinia to store viewer
    // 这里使用了断言，所以后续代码不会出现undefined
    const viewerRef = shallowRef<Viewer>({} as Viewer);
    const editor = new Editor();

    return {
        viewerRef,
        editor
    };
});
