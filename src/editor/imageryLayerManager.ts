import { ImageryLayerCollection, ImageryLayer } from "cesium";
import * as Y from "yjs";
import { nanoid } from "nanoid";
import { GeoOasisImageryLayer, Layer } from "../layer/layer";
import {
    generateWMSImageryFromLayer,
    generateSingleTileImageryFromLayer,
    generateArcgisImageryFromLayer,
    generateBingImageryFromLayer,
    generateTMSImagery
} from "../layer/utils";

export type YImageryLayer = Y.Map<unknown>;

export const defaultBaseLayers: GeoOasisImageryLayer[] = [
    {
        id: nanoid(),
        name: "Local",
        type: "imagery",
        provider: "tms",
        show: true,
        url: "cesiumStatic/Assets/Textures/NaturalEarthII"
    },
    {
        id: nanoid(),
        name: "Bing",
        type: "imagery",
        provider: "bing",
        show: true
    },
    {
        id: nanoid(),
        name: "ArcGIS",
        type: "imagery",
        provider: "arcgis",
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
        show: true
    }
];

// sync between Y.Array<Y.Map<any>> and ImageryLayersCollection.
export class ImageryLayerManager {
    imageryLayerCollection: ImageryLayerCollection | undefined;
    imageryLayersMap: Map<string, ImageryLayer>;
    yImageryLayers: Y.Array<YImageryLayer>;
    yImageryBaseLayers: Y.Map<YImageryLayer>;
    private hasBaseLayer: Boolean;

    constructor(array: Y.Array<any>, map: Y.Map<any>) {
        this.yImageryLayers = array as Y.Array<YImageryLayer>;
        this.yImageryBaseLayers = map as Y.Map<YImageryLayer>;
        this.imageryLayersMap = new Map();
        this.hasBaseLayer = false;
        this.init();
    }

    init() {
        const self = this;
        this.yImageryLayers.observe((events, transactions) => {
            self.handlerYImageryLayers(events, transactions).then(() => {
                self.syncLayerList();
            });
        });
    }

    addLayer(layerOption: GeoOasisImageryLayer) {
        const yImageryLayer = new Y.Map<unknown>() as YImageryLayer;
        for (const [key, value] of Object.entries(layerOption)) {
            yImageryLayer.set(key, value);
        }
        this.yImageryLayers.push([yImageryLayer]);
    }

    // ! Wrong
    raiseLayer(index: number) {
        const ylayer = this.yImageryLayers.get(index);
        // ! In concurrent situation, two user do this operation, delete one, but add twice.
        // ! In Yjs, AbstractType can't be added to another AbstractType twice, so will be wrong.
        this.yImageryLayers.doc?.transact(() => {
            this.yImageryLayers.delete(index);
            this.yImageryLayers.insert(index + 1, [ylayer]);
        });
    }

    lowerLayer(index: number) {
        const ylayer = this.yImageryLayers.get(index);
        this.yImageryLayers.doc?.transact(() => {
            this.yImageryLayers.delete(index);
            this.yImageryLayers.insert(index - 1, [ylayer]);
        });
    }

    deleteLayer(id: string) {
        const index = this.getIndex(id);
        if (index !== undefined) {
            this.yImageryLayers.delete(index);
        }
    }

    getLayerInfo(id: string) {
        const index = this.getIndex(id);
        if (index !== undefined) {
            const ylayer = this.yImageryLayers.get(index);
            const { url, ...rest } = ylayer.toJSON();
            return rest as Layer;
        }
    }

    async addBaseLayerOption(
        layerOption: GeoOasisImageryLayer,
        origin: Boolean
    ) {
        if (origin) {
            try {
                let cesiumLayer;
                switch (layerOption.provider) {
                    case "arcgis":
                        cesiumLayer =
                            await generateArcgisImageryFromLayer(layerOption);
                        break;
                    case "bing":
                        cesiumLayer =
                            await generateBingImageryFromLayer(layerOption);
                        break;
                    case "tms":
                        cesiumLayer = await generateTMSImagery(layerOption);
                        break;
                    default:
                        break;
                }
                if (cesiumLayer) {
                    // console.log("adding base Layer success!!", layerOption);
                    this.imageryLayersMap.set(layerOption.id, cesiumLayer);
                }
            } catch (error) {
                console.error(
                    `There was an error while creating ${layerOption.provider}. ${error}`
                );
            }
            return;
        }
        const yImageryLayer = new Y.Map<unknown>() as YImageryLayer;
        for (const [key, value] of Object.entries(layerOption)) {
            yImageryLayer.set(key, value);
        }
        this.yImageryBaseLayers.set(layerOption.id, yImageryLayer);
    }

    // the index of baseLayer is always 0 in the viewer.imageryLayers.
    setBaseLayer(name: string) {
        if (this.imageryLayerCollection) {
            const pool = defaultBaseLayers;
            const baseLayerOptionSelected = pool.find((l) => l.name === name);
            if (baseLayerOptionSelected) {
                const baseLayer = this.imageryLayersMap.get(
                    baseLayerOptionSelected.id
                );

                if (baseLayer) {
                    if (this.hasBaseLayer) {
                        const activeBaseLayer =
                            this.imageryLayerCollection.get(0);
                        this.imageryLayerCollection.remove(
                            activeBaseLayer,
                            false
                        );
                    }
                    this.imageryLayerCollection.add(baseLayer, 0);
                    this.hasBaseLayer = true;
                }
            }
        }
    }

    // create new cesium Layer(new id)
    async handlerYImageryLayers(
        _event: Y.YArrayEvent<YImageryLayer>,
        _transactions: Y.Transaction
    ) {
        // because we only can push layer, not insert. so async is fine。but If when account concurrent situation
        for (let i = 0, l = this.yImageryLayers.length; i < l; i++) {
            const yImageryLayer = this.yImageryLayers.get(i);
            const id = yImageryLayer.get("id") as string;
            if (!this.imageryLayersMap.has(id)) {
                const layer = await createImageryLayer(
                    yImageryLayer.toJSON() as GeoOasisImageryLayer
                );
                if (layer) {
                    // TODO: when Error occurs
                    this.imageryLayersMap.set(id, layer);
                }
            }
            const self = this;
            yImageryLayer.observe(self.handlerYImageryLayer);
        }
    }

    // sync between Y.Map and Cesium's ImageryLayer
    handlerYImageryLayer(
        event: Y.YMapEvent<any>,
        _transactions: Y.Transaction
    ) {
        // const obj = {} as ImageryLayer.ConstructorOptions;
        const keys = event.changes.keys;
        keys.forEach((change, key) => {
            if (change.action === "update") {
                const target = event.target;
                const id = target.get("id") as string;
                const imagerylayer = this.imageryLayersMap.get(
                    id
                ) as ImageryLayer;
                const updateVal = target.get(key);
                if (key === "hue") {
                    imagerylayer[key] = updateVal;
                }
            }
        });
    }

    private syncLayerList() {
        let activeBaseLayer;
        if (this.hasBaseLayer) {
            activeBaseLayer = this.imageryLayerCollection?.get(0);
        }
        // TODO：there will be flickering, only modify the source code, implement a 'removeAllExceptBaseLayer' method.
        this.imageryLayerCollection?.removeAll(false);
        if (activeBaseLayer) {
            this.imageryLayerCollection?.add(activeBaseLayer);
        }

        const afterIds = new Set<string>();
        // update layers
        this.yImageryLayers.forEach((yImageryLayer, _index) => {
            const id = yImageryLayer.get("id") as string;
            afterIds.add(id);
            const layer = this.imageryLayersMap.get(id);
            if (layer) {
                this.imageryLayerCollection?.add(layer);
            }
        });

        // * clear and destroy unused layers
        const ids = [...this.imageryLayersMap.keys()];
        const diff = ids.filter((id) => {
            return (
                !afterIds.has(id) && !defaultBaseLayers.find((l) => l.id === id)
            );
        });
        for (let i = 0, l = diff.length; i < l; i++) {
            const id = diff[i];
            const layer = this.imageryLayersMap.get(id);
            if (layer) {
                layer.destroy();
            }
            this.imageryLayersMap.delete(id);
        }
    }

    private getIndex(id: string) {
        for (let i = 0, l = this.yImageryLayers.length; i < l; i++) {
            const ylayer = this.yImageryLayers.get(i);
            if (ylayer.get("id") === id) {
                return i;
            }
        }
    }
}

async function createImageryLayer(layer: GeoOasisImageryLayer) {
    try {
        switch (layer.provider) {
            case "wmts":
                break;
            case "wms":
                return generateWMSImageryFromLayer(layer);
            case "singleTile":
                return await generateSingleTileImageryFromLayer(layer);
            default:
                break;
        }
    } catch (error) {
        console.error(
            `There was an error while creating ${layer.name}. ${error}`
        );
    }
}
