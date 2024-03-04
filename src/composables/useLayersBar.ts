import { onMounted, ref, shallowRef } from "vue";
import {
    ImageryLayer,
    ImageryProvider,
    createWorldImageryAsync,
    Cartesian3,
    Color,
    Entity
} from "cesium";
import { useViewerStore } from "../store/viewer-store";
import { storeToRefs } from "pinia";
interface ILayerItem {
    index: number;
    name: string;
    layer: ImageryLayer;
}

export const useLayersBar = () => {
    // data or state or viewModel
    // Map数据结构
    const baseLayers = ref<ILayerItem[]>([]);
    // const trueLayers = shallowRef<ImageryLayer[]>([]);

    // store
    const viewerStore = useViewerStore();
    const { viewerRef } = storeToRefs(viewerStore);

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
        updateLayerList();
    };

    async function addBasyLayerOption(
        name: string,
        imageryProviderPromise: Promise<ImageryProvider>
    ) {
        try {
            const imageryProvider = await Promise.resolve(
                imageryProviderPromise
            );
            const baseLayer = new ImageryLayer(imageryProvider);
            baseLayers.value.push({
                index: baseLayers.value.length,
                name: name,
                layer: baseLayer
            });
            viewerRef.value.imageryLayers.add(baseLayer);
            // trueLayers.value.push(layer);
        } catch (error) {
            console.error(
                `There was an error while creating ${name}. ${error}`
            );
        }
    }

    const updateLayerList = () => {
        const numLayers = viewerRef.value.imageryLayers.length;
        baseLayers.value.splice(0, baseLayers.value.length);
        // trueLayers.value.splice(0, trueLayers.value.length);
        for (let i = numLayers - 1; i >= 0; --i) {
            // trueLayers.value.push(viewerRef.value.imageryLayers.get(i));
            baseLayers.value.push({
                index: i,
                name: `Layer${i}!!!`,
                layer: viewerRef.value.imageryLayers.get(i)
            });
        }
    };

    // mounted
    onMounted(() => {
        // add base Layer
        addBasyLayerOption("Bing Maps Aerial", createWorldImageryAsync());
        updateLayerList();
        console.log("LayersBar mounted");
        // console.log("dope!!");
        // console.log(viewerRef.value.container);
        // setupLayers();
    });

    return {
        baseLayers,
        updateLayerList
        // addLayerItem,
        // deleteLayerItem
    };
};
