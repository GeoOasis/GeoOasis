import { ref, watch } from "vue";
import { nanoid } from "nanoid";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { newImageElement } from "../element/newElement";
import { FileType, getFileType } from "../utils";

export const useUpLoadFile = () => {
    const store = useGeoOasisStore();
    const selectedFile = ref<File>();
    watch(selectedFile, () => {
        if (selectedFile.value !== undefined) {
            handleLoadFile(selectedFile.value);
            selectedFile.value = undefined;
        }
    });

    const handleLoadFile = (file: File) => {
        const editor = store.editor;
        const fileType = getFileType(file.name);
        if (!fileType) {
            throw new Error("unknown file type");
        }
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
            if (fileType === FileType.GEOJSON || fileType === FileType.JSON) {
                try {
                    const jsonObj = JSON.parse(e.target!.result as string);
                    editor.addLayer({
                        id: nanoid(),
                        name: "Geojsontest",
                        type: "service",
                        provider: "geojson",
                        url: jsonObj,
                        show: true
                    });
                } catch (e) {
                    console.error("file format isn't vivid JSON format", e);
                }
            } else if (fileType === FileType.GLB) {
                const glbUint8Array = new Uint8Array(
                    e.target?.result as ArrayBuffer
                );
                editor.assetLibrary.addAsset({
                    name: file.name,
                    data: glbUint8Array
                });
            } else if (fileType === FileType.PNGImage) {
                const imageArr = new Uint8Array(
                    e.target?.result as ArrayBuffer
                );
                const imageElement = newImageElement({
                    name: "",
                    show: "true",
                    url: imageArr
                    // url: e.target?.result
                });
                editor.addElement(imageElement);
            }
        });

        // TODO: optimize, we don't want to use Yjs to transfer data? or we can use Yjs to transfer data
        if (
            fileType === FileType.GEOJSON ||
            fileType === FileType.JSON ||
            fileType === FileType.GLTF
        ) {
            reader.readAsText(file); // 读取文件内容为文本
        } else if (
            fileType === FileType.PNGImage ||
            fileType === FileType.GLB
        ) {
            reader.readAsArrayBuffer(file);
        }
    };

    return {
        selectedFile
    };
};
