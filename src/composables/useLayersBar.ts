import { watch, ShallowRef, ref } from "vue";
import { storeToRefs } from "pinia";
import * as Y from "yjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { useLogStore } from "../store/Log.store";
import { YElement } from "../type";
import { YImageryLayer } from "../editor/imageryLayerManager";
import { TerrainOption } from "../editor/terrain";
import { createRealTimeHeatmap } from "./real-time-heatmap-analysis";

export const useLayersBar = () => {
    const store = useGeoOasisStore();
    const {
        selectedTerrain,
        selectedBaseLayer,
        selectedElement,
        selectedLayer,
        elementArray,
        layersArray,
        imageryLayersArray
    } = storeToRefs(store);
    const { editor } = store;

    const { addLog } = useLogStore();

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

    const selectTerrain = (terrain: TerrainOption) => {
        editor.setTerrain(terrain);
    }

    let control: any;
    const isTick = ref(false);

    let timer: number | null = null;
    const start = () => {
        if (!timer) {
            timer = window.setInterval(() => {
                control.tickOnce();
                addLog("tickOnce");
            }, 1000);
        }
    }

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
            addLog(`绘制次数：${control.statics.js.length}`, "success");
            addLog(`JS平均绘制时间：${control.statics.js.reduce((a: number, b: number) => a + b, 0) / control.statics.js.length}`, "success");
            addLog(`WASM平均绘制时间：${control.statics.rust.reduce((a: number, b: number) => a + b, 0) / control.statics.rust.length}`, "success");
        }
    }

    const handleTickBtn = () => {
        if (!control) {
            let result = createRealTimeHeatmap(store.editor.viewer!);
            if (result) {
                control = result;
            }
        }

        isTick.value = !isTick.value;
        if (isTick.value) {
            start();
        } else {
            stop();
        }
    };

    return {
        isTick,
        handleTickBtn,
        selectedTerrain,
        selectedBaseLayer,
        elementArray: elementArray as ShallowRef<YElement[]>,
        layersArray: layersArray as ShallowRef<Y.Map<any>[]>,
        imageryLayersArray: imageryLayersArray as ShallowRef<YImageryLayer[]>,
        handleSelect,
        handleDelete,
        selectTerrain,
    };
};
