import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { Model, Transforms, Cartesian3, HeadingPitchRoll } from "cesium";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { Layer } from "../layer/layer";
import { Element } from "../element/element";
import { newModelElement } from "../element/newElement";

export const useLayersBar = () => {
    const store = useGeoOasisStore();
    const {
        viewerRef,
        selectedBaseLayer,
        selectedElement,
        selectedLayer,
        elementState,
        layerState
    } = storeToRefs(store);
    const { editor } = store;

    const elementsRef = computed<Element[]>(() =>
        Object.values(elementState.value)
    );

    const layersRef = computed<Layer[]>(() => Object.values(layerState.value));

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

        // const air111 = await Model.fromGltfAsync({
        //     url: "./Cesium_Air.glb",
        //     modelMatrix: Transforms.headingPitchRollToFixedFrame(
        //         Cartesian3.fromDegrees(-110.0, 20.0, 50),
        //         new HeadingPitchRoll(0, 0, 0)
        //     ),
        //     debugShowBoundingVolume: false,
        //     scale: 1
        // });

        // store.viewerRef.scene.primitives.add(air111);
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
        elementsRef,
        layersRef,
        add3dtilesTest,
        handleSelect,
        handleDelete
    };
};
