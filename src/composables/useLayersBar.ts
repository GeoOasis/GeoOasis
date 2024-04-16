import { onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { GeoOasisLayer } from "../layer/layer";
import { Element } from "../element/element";

export const useLayersBar = () => {
    const elementsRef = reactive<Element[]>([]);
    const baseLayersRef = reactive<GeoOasisLayer[]>([]);
    const layersRef = reactive<GeoOasisLayer[]>([]);

    // store
    const store = useGeoOasisStore();
    const { viewerRef, selectedBaseLayer } = storeToRefs(store);
    const { editor } = store;

    // mounted
    onMounted(() => {
        console.log("LayersBar mounted");
        viewerRef.value.imageryLayers.layerAdded.addEventListener((e) => {
            console.log("layer added!!!", e);
        });
        // TODO 需要添加addLayer的按钮和panel
        editor.addEventListener("elementAdded", (event: any) => {
            console.log(event);
            elementsRef.push(event.detail.element);
        });
        editor.addEventListener("baseLayerAdded", (event: any) => {
            baseLayersRef.push(event.detail.layer);
        });
        editor.addEventListener("layerAdded", (event: any) => {
            console.log("--------------------layer added!!!", event);
            layersRef.push(event.detail.layer);
        });
        setupLayers();
    });

    watch(selectedBaseLayer, () => {
        // 预设底图的索引始终为0
        // 在初始化的时候，默认已经底图了
        const activeLayer = viewerRef.value.imageryLayers.get(0);
        viewerRef.value.imageryLayers.remove(activeLayer, false);

        const baseLayer = editor.getBaseLayer(selectedBaseLayer.value);
        if (baseLayer) {
            console.log("basemap changed");
            viewerRef.value.imageryLayers.add(baseLayer, 0);
        }
    });

    // methods
    const setupLayers = () => {
        editor.addBaseLayerOption({
            id: nanoid(),
            name: "Bing",
            type: "imagery",
            provider: "bing",
            show: true
        });
        editor.addBaseLayerOption({
            id: nanoid(),
            name: "ArcGIS",
            type: "imagery",
            provider: "arcgis",
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
            show: true
        });
    };

    const add3dtilesTest = () => {
        editor.addLayer({
            id: nanoid(),
            name: "3dTiles",
            type: "3dtiles",
            url: "http://127.0.0.1:5500/tileset.json",
            show: true
        });
        editor.addLayer({
            id: nanoid(),
            name: "United States Weather Radar",
            type: "imagery",
            provider: "wms",
            show: true,
            url: "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?",
            credit: "Radar data courtesy Iowa Environmental Mesonet",
            layer: "nexrad-n0r",
            parameters: {
                transparent: "true",
                format: "image/png"
            }
        });
        editor.addLayer({
            id: nanoid(),
            name: "United States GOES Infrared",
            type: "imagery",
            provider: "wms",
            show: true,
            url: "https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?",
            credit: "Infrared data courtesy Iowa Environmental Mesonet",
            layer: "goes_conus_ir",
            parameters: {
                transparent: "true",
                format: "image/png"
            }
        });
    };

    return {
        selectedBaseLayer,
        elementsRef,
        baseLayersRef,
        layersRef,
        add3dtilesTest
    };
};
