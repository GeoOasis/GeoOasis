import { onMounted, reactive, ref, shallowRef, watch } from "vue";
import {
    ArcGisMapServerImageryProvider,
    ImageryLayer,
    ImageryProvider,
    createWorldImageryAsync,
    WebMapServiceImageryProvider
} from "cesium";
import { useViewerStore } from "../store/viewer-store";
import { storeToRefs } from "pinia";
import { GeoOasisLayer } from "../layer/layer";
import { Element } from "../element/element";
import { nanoid } from "nanoid";

export const useLayersBar = () => {
    // data or state
    const baseLayers: ImageryLayer[] = [];

    const selectedLayer = ref("Bing");
    // TODO 目前这种方法不是很好
    const elementsRef = reactive<Element[]>([]);
    const baseLayersRef = reactive<GeoOasisLayer[]>([]);
    const additionalLayersRef = reactive<GeoOasisLayer[]>([]);

    // store
    const viewerStore = useViewerStore();
    const { viewerRef } = storeToRefs(viewerStore);
    const { editor } = viewerStore;

    // mounted
    onMounted(() => {
        console.log("LayersBar mounted");
        // TODO 需要添加addLayer的按钮和panel
        setupLayers();
        // updateLayerList();
        editor.addEventListener("elementAdded", (event) => {
            console.log(event);
            // @ts-ignore
            elementsRef.push(event.detail.element);
        });
    });

    watch(selectedLayer, () => {
        console.log("basemap changed");
        // 预设底图的索引始终为0
        const activeLayer = viewerRef.value.imageryLayers.get(0);
        viewerRef.value.imageryLayers.remove(activeLayer, false);
        const layerIndex = baseLayersRef.findIndex(
            (layer) => layer.name === selectedLayer.value
        );
        const layer = baseLayers[layerIndex];
        if (layer) {
            viewerRef.value.imageryLayers.add(layer, 0);
        }
    });

    // methods
    // const addLayerItem = (name: string) => {
    //     baseLayers.value.push({
    //         index: baseLayers.value.length,
    //         name: name
    //     });
    // };

    // const deleteLayerItem = (index: number) => {
    //     baseLayers.value.splice(index, 1);
    // };

    const setupLayers = () => {
        // updateLayerList();
        addBaseLayerOption("Bing", createWorldImageryAsync());
        addBaseLayerOption(
            "ArcGIS",
            ArcGisMapServerImageryProvider.fromUrl(
                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
            )
        );
        addAdditionalLayerOption(
            "United States GOES Infrared",
            // @ts-ignore
            new WebMapServiceImageryProvider({
                url: "https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?",
                layers: "goes_conus_ir",
                credit: "Infrared data courtesy Iowa Environmental Mesonet",
                parameters: {
                    transparent: "true",
                    format: "image/png"
                }
            })
        );
        addAdditionalLayerOption(
            "United States Weather Radar",
            // @ts-ignore
            new WebMapServiceImageryProvider({
                url: "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?",
                layers: "nexrad-n0r",
                credit: "Radar data courtesy Iowa Environmental Mesonet",
                parameters: {
                    transparent: "true",
                    format: "image/png"
                }
            })
        );
    };

    async function addBaseLayerOption(
        name: string,
        imageryProviderPromise: Promise<ImageryProvider>
    ) {
        try {
            const imageryProvider = await Promise.resolve(
                imageryProviderPromise
            );
            const baseLayer = new ImageryLayer(imageryProvider);
            baseLayers.push(baseLayer);
            // viewerRef.value.imageryLayers.add(baseLayer);
            baseLayersRef.push({
                id: nanoid(),
                name: name,
                type: "imagery",
                show: true
            });
            // baseLayers.value.push({
            //     index: baseLayers.value.length,
            //     name: name
            // });
        } catch (error) {
            console.error(
                `There was an error while creating ${name}. ${error}`
            );
        }
    }

    async function addAdditionalLayerOption(
        name: string,
        imageryProviderPromise: Promise<ImageryProvider>
    ) {
        try {
            const imageryProvider = await Promise.resolve(
                imageryProviderPromise
            );
            const layer = new ImageryLayer(imageryProvider);
            layer.alpha = 0.5;
            layer.show = true;
            viewerRef.value.imageryLayers.add(layer);
            additionalLayersRef.push({
                id: nanoid(),
                name: name,
                type: "imagery",
                show: true
            });
        } catch (error) {
            console.log(`There was an error while creating ${name}. ${error}`);
        }
    }

    const updateLayerList = () => {};

    return {
        selectedLayer,
        elementsRef,
        baseLayersRef,
        additionalLayersRef,
        updateLayerList
        // addLayerItem,
        // deleteLayerItem
    };
};
