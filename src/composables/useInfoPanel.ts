import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { useGeoOasisStore } from "../store/GeoOasis.store";
// import { newImageElement } from "../element/newElement";

export const useInfoPanel = () => {
    const store = useGeoOasisStore();
    const { selectedElement, selectedLayer, toolBox } = storeToRefs(store);
    const { editor } = store;
    const form = ref<any[]>([]);

    watch(selectedElement, () => {
        form.value = [];
        if (selectedElement.value) {
            for (const [key, value] of Object.entries(selectedElement.value)) {
                form.value.push([key, value]);
            }
        }
    });

    const handleElementChange = (update: { [key: string]: any }) => {
        if (selectedElement.value) {
            editor.mutateElement(selectedElement.value.id, update);
        }
    };

    const isToolBoxVisible = ref(false);
    const selectedTool = ref("buffer");
    const tools = ["buffer", "heatmap", "interpolation"];
    const isWasm = ref(false);
    const computeMode = computed(() => (isWasm.value ? "wasm" : "js"));

    const handleExecuteBtn = async (tool: string) => {
        if (!selectedLayer.value) return;
        const geojsonData = editor.getLayerData(selectedLayer.value.id);
        let data: any;
        let option: any = {}; // TODO: option应该是是state，而且是动态的
        option.mode = computeMode.value;
        if (tool === "buffer") {
            option = {
                ...option,
                size: 100
            };
            data = geojsonData;
        } else if (tool === "heatmap") {
            // only for point geojosn
            // prepare data
            const extent = {
                minLng: Infinity,
                minLat: Infinity,
                maxLng: -Infinity,
                maxLat: -Infinity
            };
            data = [];
            geojsonData.features.forEach((feature: any) => {
                const coord = feature.geometry.coordinates;
                extent.minLng = Math.min(extent.minLng, coord[0]);
                extent.minLat = Math.min(extent.minLat, coord[1]);
                extent.maxLng = Math.max(extent.maxLng, coord[0]);
                extent.maxLat = Math.max(extent.maxLat, coord[1]);
                data.push({
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0],
                    heat: feature.properties.heat
                });
            });

            option = {
                ...option,
                size: 256,
                radius: 10,
                maxHeat: 20,
                // size: 5000,
                // radius: 10,
                // maxHeat: 10,
                gradient: ["00AAFF", "00FF00", "FFFF00", "FF8800", "FF0000"],
                extent: extent
            };
            console.log(extent);
        }

        const result = await toolBox.value.runTool(tool, data, option);
        const id = nanoid();
        if (tool === "buffer") {
            editor.addLayer({
                id,
                name: "bufferResult",
                type: "service",
                provider: "geojson",
                url: result as Object,
                show: true
            });
        } else if (tool === "heatmap") {
            let canvas = document.createElement("canvas");
            canvas.width = result.width;
            canvas.height = result.height;
            const ctx = canvas.getContext("2d");
            // document.body.appendChild(canvas);
            // canvas.style.position = "absolute";
            // canvas.style.bottom = "0px";
            // canvas.style.right = "0px";
            // canvas.style.width = "600px";
            // canvas.style.height = "400px";
            // canvas.style.pointerEvents = "none";
            // canvas.style.zIndex = "9999";
            // canvas.style.border = "1px solid red";
            ctx?.putImageData(result, 0, 0);
            // canvas.toBlob(
            //     (blob) => {
            //         blob?.arrayBuffer().then((buffer) => {
            //             const imageArr = new Uint8Array(buffer);
            //             const heatmap = newImageElement({
            //                 name: "heatMap",
            //                 url: imageArr,
            //                 extent: option.extent
            //             });
            //             editor.addElement(heatmap);
            //         });
            //     },
            //     "image/png",
            //     1.0
            // );
            const pngDataUrl = canvas?.toDataURL("image/png", 1.0);
            editor.addLayer({
                id,
                name: "heatMap",
                type: "imagery",
                provider: "singleTile",
                show: true,
                url: pngDataUrl,
                parameters: {
                    extent: option.extent
                }
            });
        }
    };

    return {
        form,
        selectedElement,
        selectedLayer,
        isToolBoxVisible,
        selectedTool,
        tools,
        isWasm,
        handleElementChange,
        handleExecuteBtn
    };
};
