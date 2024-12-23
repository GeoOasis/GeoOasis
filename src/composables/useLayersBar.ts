import { onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { useGeoOasisStore } from "../store/GeoOasis.store";

export const useLayersBar = () => {
    const store = useGeoOasisStore();
    const {
        viewerRef,
        selectedBaseLayer,
        selectedElement,
        selectedLayer,
        elementArray,
        layersArray
    } = storeToRefs(store);
    const { editor } = store;

    // mounted
    onMounted(() => {
        console.log("LayersBar mounted");
        viewerRef.value.imageryLayers.layerAdded.addEventListener((e) => {
            console.log("layer added!!!", e);
        });
        // TODO 需要添加addLayer的按钮和panel
        setupBaseLayers();
    });

    watch(selectedBaseLayer, () => {
        editor.setBaseLayer(selectedBaseLayer.value);
    });

    // methods
    const setupBaseLayers = () => {
        editor.addBaseLayer(
            {
                id: nanoid(),
                name: "Local",
                type: "imagery",
                provider: "tms",
                show: true,
                url: "cesiumStatic/Assets/Textures/NaturalEarthII"
            },
            true
        );
        editor.addBaseLayer(
            {
                id: nanoid(),
                name: "Bing",
                type: "imagery",
                provider: "bing",
                show: true
            },
            true
        );
        editor.addBaseLayer(
            {
                id: nanoid(),
                name: "ArcGIS",
                type: "imagery",
                provider: "arcgis",
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
                show: true
            },
            true
        );
    };

    const add3dtilesTest = async () => {
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

    return {
        selectedBaseLayer,
        elementArray,
        layersArray,
        add3dtilesTest,
        handleSelect,
        handleDelete
    };
};
