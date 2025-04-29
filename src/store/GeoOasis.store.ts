import { defineStore } from "pinia";
import { shallowRef, ref, computed } from "vue";
import { useAwareness } from "../composables/useAwareness";
import {
    useSyncArray,
    useSyncMap,
    useSyncMapArray,
    useSyncText
} from "../composables/useSync";
import { Editor } from "../editor/editor";
import { Element } from "../element/element";
import { Layer } from "../layer/layer";
import { ToolBox } from "../tool/ToolBox";
import { DrawMode, GizmoMode } from "../editor/type";
import { defaultAsset } from "../editor/assetLibrary";
import { TerrainOption } from "../editor/terrain";

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
    const imageryLayersArray = useSyncArray(
        editor.value.imageryLayerManager.yImageryLayers
    );
    const assetState = useSyncArray(editor.value.assetLibrary.assetArray);
    const title = useSyncText(editor.value.title);
    const options = useSyncMap<{ terrain: TerrainOption }>(
        editor.value.options,
        ["terrain"]
    );
    const selectedTerrain = computed(() => options.terrain.value);

    const roomId = ref("");
    const { userList, setUser, setUserPosition } = useAwareness(
        editor.value,
        roomId
    );

    const activeTool = ref("default");
    const drawMode = ref(DrawMode.SURFACE);
    const gizmoMode = ref(GizmoMode.TRANSLATE);
    const selectedModelIdx = ref<number>();
    const assetsOption = computed(() => defaultAsset.concat(assetState.value));

    return {
        editor,
        toolBox,
        elementArray,
        layersArray,
        imageryLayersArray,
        assetState,
        title,
        selectedTerrain,
        isPanelVisible,
        selectedElement,
        selectedLayer,
        selectedBaseLayer,
        userList,
        roomId,
        activeTool,
        drawMode,
        gizmoMode,
        selectedModelIdx,
        assetsOption,
        setUser,
        setUserPosition
    };
});
