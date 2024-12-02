import {
    Entity,
    Viewer,
    CallbackProperty,
    Cartesian2,
    Cartesian3,
    Matrix4,
    Color,
    ImageryLayer,
    DataSource,
    Primitive,
    Cesium3DTileset,
    GeoJsonDataSource,
    PolygonHierarchy,
    Transforms,
    HeadingPitchRoll,
    ConstantProperty,
    IonResource,
    Quaternion,
    Matrix3
} from "cesium";
import * as Y from "yjs";
import { ObservableV2 } from "lib0/observable.js";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { createHocuspocusProvider } from "./provider";
import {
    Element,
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement,
    GeoOasisPolygonElement,
    GeoOasisImageElement,
    GeoOasisRectangleElement
} from "../element/element";
import {
    cartesian3FromPoint3,
    generatePointEntityfromElement,
    generatePolylineEntityfromElement,
    generatePolygonEntityfromElement,
    generateModelEntityfromElement,
    generateRectangleEntityfromElement
} from "../element/utils";
import { Point3 } from "../element/point";
import {
    GeoOasis3DTilesLayer,
    GeoOasisImageryLayer,
    Layer,
    GeoOasisServiceLayer
} from "../layer/layer";
import {
    generateArcgisImageryFromLayer,
    generateBingImageryFromLayer,
    generateWMSImageryFromLayer,
    generateSingleTileImageryFromLayer,
    generateTMSImagery
} from "../layer/utils";
import { Hocuspocus_URL } from "../contants";
import { nanoid } from "nanoid";

export type EditorEvent = {
    "element:add": (key: string) => void;
    "element:update": () => void;
    "element:delete": () => void;
};

export interface BaseEditor {
    pickElement(position: Cartesian2): Element | undefined;
    getElement(id: Element["id"]): Element | undefined;
    addElement(element: Element): void;
    deleteElement(id: Element["id"]): void;
    mutateElement(id: Element["id"], update: { [key: string]: any }): void;
    getLayer(id: Layer["id"]): Layer | undefined;
    addLayer(layer: Layer): void;
    getLayerData(id: Layer["id"]): any;
    deleteLayer(id: Layer["id"]): void;
    startEdit(id: Element["id"], type: Element["type"]): void;
    stopEdit(id: Element["id"], type: Element["type"]): void;
}

// Editor is singleton
export class Editor extends ObservableV2<EditorEvent> implements BaseEditor {
    private yjsProvider?: HocuspocusProvider;
    private doc: Y.Doc;
    public elements: Y.Map<Y.Map<any>>; // how to use correct type? don't use Map
    public layers: Y.Map<Y.Map<any>>;
    public baseLayers: Y.Map<Y.Map<any>>;
    private entities: Map<string, Entity> = new Map();
    public viewer: Viewer | undefined;
    public undoManager: Y.UndoManager;

    // TODO：type TrueLayer = ImageryLayer | DataSource | Primitive
    // TODO: 减少状态
    private baseLayersArray: Array<GeoOasisImageryLayer> = new Array();
    private imageryLayersMap: Map<Layer["id"], ImageryLayer> = new Map();
    private serviceLayersMap: Map<Layer["id"], DataSource> = new Map(); // use Array?
    private serviceLayersArray: [Layer["id"], DataSource][] = new Array();
    private cesium3dtilesLayersMap: Map<Layer["id"], Primitive> = new Map();

    constructor() {
        super();
        this.doc = new Y.Doc();
        new IndexeddbPersistence("oasis-doc", this.doc);
        this.elements = this.doc.getMap("ElementsMap");
        this.layers = this.doc.getMap("LayersMap");
        this.baseLayers = this.doc.getMap("BaseLayersMap");
        this.undoManager = new Y.UndoManager([this.elements, this.layers]);
        this.init();
    }

    get provider() {
        return this.yjsProvider;
    }

    init() {
        const self = this;
        // the source of truth
        this.elements.observeDeep((events, transactions) => {
            self.handleYjsElementsEvents(events, transactions);
        });
        this.layers.observeDeep((events, transactions) => {
            self.handleYjsLayersEvents(events, transactions);
        });
    }

    // change room
    changeRoom(roomId?: string) {
        this.disconnectProvider();
        const nextId = roomId ? roomId : nanoid();
        this.yjsProvider = createHocuspocusProvider(
            Hocuspocus_URL,
            nextId,
            this.doc
        );
        return nextId;
    }

    disconnectProvider() {
        if (this.yjsProvider) {
            this.yjsProvider.awareness?.destroy();
            this.yjsProvider.removeAllListeners();
            this.yjsProvider.disconnect();
            this.yjsProvider.destroy();
            this.yjsProvider = undefined;
        }
    }

    startEdit(id: Element["id"], type: Element["type"]): void {
        const entity = this.entities.get(id) as Entity;
        switch (type) {
            case "point":
                // @ts-ignore
                entity.position = new CallbackProperty(() => {
                    return cartesian3FromPoint3(
                        this.elements.get(id)?.get("positions")[0]
                    );
                }, false);
                break;
            case "polyline":
                // @ts-ignore
                entity.polyline.positions = new CallbackProperty(() => {
                    return this.elements
                        .get(id)
                        ?.get("positions")
                        .map((p: Point3) => cartesian3FromPoint3(p));
                }, false);
                break;
            case "polygon":
                // @ts-ignore
                entity.polygon.hierarchy = new CallbackProperty(() => {
                    let activePoinst = this.elements
                        .get(id)
                        ?.get("positions")
                        .map((p: Point3) => cartesian3FromPoint3(p));
                    return new PolygonHierarchy(activePoinst);
                }, false);
                break;
            case "model":
                // @ts-ignore
                entity.position = new CallbackProperty(() => {
                    return cartesian3FromPoint3(
                        this.elements.get(id)?.get("positions")[0]
                    );
                }, false);
                entity.orientation = new CallbackProperty(() => {
                    const pos = cartesian3FromPoint3(
                        this.elements.get(id)?.get("positions")[0]
                    );
                    const { heading, pitch, roll } = this.elements
                        .get(id)
                        ?.get("orientation");
                    const hpr = new HeadingPitchRoll(heading, pitch, roll);
                    return Transforms.headingPitchRollQuaternion(pos, hpr);
                }, false);
                break;
            case "image":
                break;
        }
    }

    stopEdit(id: Element["id"], type: Element["type"]): void {
        const entity = this.entities.get(id) as Entity;
        switch (type) {
            case "point":
                // @ts-ignore
                entity.position = cartesian3FromPoint3(
                    this.elements.get(id)?.get("positions")[0]
                );
                break;
            case "polyline":
                // 若要阻止闪烁，可能需要再渲染一个entity
                //@ts-ignore
                entity.polyline.positions = this.elements
                    .get(id)
                    ?.get("positions")
                    .map((p: Point3) => cartesian3FromPoint3(p));
                break;
            case "polygon":
                // @ts-ignore
                entity.polygon.hierarchy = new PolygonHierarchy(
                    this.elements
                        .get(id)
                        ?.get("positions")
                        .map((p: Point3) => cartesian3FromPoint3(p))
                );
                break;
            case "model":
                break;
        }
    }

    // TODO: Does it need to be converted to JOSN format?
    getElement(id: Element["id"]): Element | undefined {
        return this.elements.get(id)?.toJSON() as Element;
    }

    addElement(element: Element): void {
        const elementYMap = new Y.Map();
        for (const [key, value] of Object.entries(element)) {
            elementYMap.set(key, value);
        }
        this.elements.set(element.id, elementYMap);
    }

    deleteElement(id: Element["id"]): void {
        this.elements.delete(id);
    }

    mutateElement(id: Element["id"], update: { [key: string]: any }): void {
        const element = this.elements.get(id);
        for (const [key, value] of Object.entries(update)) {
            element?.set(key, value);
        }
    }

    pickElement(position: Cartesian2) {
        const pickedEntity = this.viewer?.scene.pick(position);
        if (pickedEntity) {
            return this.elements.get(pickedEntity.id.id)?.toJSON() as Element;
        }
        return undefined;
    }

    pickLayer(position: Cartesian2) {
        const pickedEntity = this.viewer?.scene.pick(position);
        if (pickedEntity) {
            const entity = pickedEntity.id;
            const entityCollection = entity.entityCollection;
            const owner = entityCollection.owner;
            // console.log("ower:", owner);
            const found = this.serviceLayersArray.find(
                ([layerId, dataSource]) => {
                    return dataSource === owner;
                }
            );
            console.log("layerfound", found);
            const pickedId = found?.[0];
            if (pickedId) {
                console.log(this.layers.get(pickedId)?.toJSON());
                return this.layers.get(pickedId)?.toJSON() as Layer;
            }
        }
        return undefined;
    }

    getLayerData(id: Layer["id"]) {
        // TODO
        return this.layers.get(id)?.get("url");
    }

    getLayer(id: Layer["id"]): Layer | undefined {
        if (!this.layers.has(id)) return undefined;
        // @ts-ignore
        const { url, ...rest } = this.layers.get(id)?.toJSON();
        return rest as Layer;
    }

    addLayer(layer: Layer) {
        const layerMap = new Y.Map();
        for (const [key, value] of Object.entries(layer)) {
            layerMap.set(key, value);
        }
        this.layers.set(layer.id, layerMap);
    }

    deleteLayer(id: Layer["id"]): void {
        this.layers.delete(id);
    }

    setBaseLayer(name: string) {
        // 预设底图的索引始终为0
        // 在初始化的时候，默认已经有底图了
        if (this.viewer) {
            const activeBaseLayer = this.viewer.imageryLayers.get(0);
            this.viewer.imageryLayers.remove(activeBaseLayer, false);

            const baseLayerOption = this.baseLayersArray.find(
                (layer) => layer.name === name
            );
            if (baseLayerOption) {
                const baseLayer = this.imageryLayersMap.get(baseLayerOption.id);
                if (baseLayer) {
                    this.viewer.imageryLayers.add(baseLayer, 0);
                }
            }
        }
    }

    async addBaseLayer(layer: GeoOasisImageryLayer, origin: Boolean) {
        if (origin) {
            let cesiumLayer;
            switch (layer.provider) {
                case "arcgis":
                    cesiumLayer = await generateArcgisImageryFromLayer(layer);
                    break;
                case "bing":
                    cesiumLayer = await generateBingImageryFromLayer(layer);
                    break;
                case "tms":
                    cesiumLayer = await generateTMSImagery(layer);
                    break;
                default:
                    break;
            }
            if (cesiumLayer) {
                this.imageryLayersMap.set(layer.id, cesiumLayer);
                this.baseLayersArray.push(layer);
                // console.log("Add baseLayer option success");
            }
            return;
        }
        const layerMap = new Y.Map();
        for (const [key, value] of Object.entries(layer)) {
            layerMap.set(key, value);
        }
        this.baseLayers.set(layer.id, layerMap);
    }

    private async addLayerToCesium(layerAdded: Layer) {
        let layer;
        switch (layerAdded.type) {
            case "imagery":
                layer = await this.addImageryLayer(layerAdded);
                if (layer) {
                    layer.alpha = 0.5;
                    this.viewer?.imageryLayers.add(layer);
                    this.imageryLayersMap.set(layerAdded.id, layer);
                }
                break;
            case "service":
                layer = await this.addServiceLayer(layerAdded);
                if (layer) {
                    this.viewer?.dataSources.add(layer);
                    this.serviceLayersMap.set(layerAdded.id, layer);
                    this.serviceLayersArray.push([layerAdded.id, layer]);
                }
                break;
            case "3dtiles":
                if (!layerAdded.tileset) {
                    let resource;
                    if (layerAdded.ion) {
                        resource = await IonResource.fromAssetId(
                            Number(layerAdded.url)
                        );
                    } else {
                        resource = layerAdded.url;
                    }
                    const tilesetJson =
                        await Cesium3DTileset.loadJson(resource);
                    this.layers.get(layerAdded.id)?.set("tileset", tilesetJson);
                } else {
                    // TODO: offline
                    this.renderBoundingVolume(layerAdded.tileset);
                }
                layer = await this.add3dtilesLayer(layerAdded);
                if (layer) {
                    this.viewer?.scene.primitives.add(layer);
                    this.cesium3dtilesLayersMap.set(
                        layerAdded.id,
                        layer as any
                    );
                    await this.viewer?.zoomTo(layer);
                }
                break;
            case "terrain":
                break;
        }
    }

    private async addImageryLayer(layer: GeoOasisImageryLayer) {
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

    private async addServiceLayer(layer: GeoOasisServiceLayer) {
        switch (layer.provider) {
            // TODO 优化
            case "geojson":
                const geojsonDataSource = await GeoJsonDataSource.load(
                    layer.url,
                    {
                        markerSize: 12
                    }
                );
                return geojsonDataSource;
            case "gpx":
            case "kml":
            case " czml":
            case "custom":
        }
    }

    private async add3dtilesLayer(layer: GeoOasis3DTilesLayer) {
        try {
            let tileset;
            if (layer.ion) {
                tileset = await Cesium3DTileset.fromIonAssetId(
                    Number(layer.url)
                );
            } else {
                tileset = await Cesium3DTileset.fromUrl(layer.url);
            }
            return tileset;
        } catch (error) {
            console.error(`Error creating tileset: ${error}`);
        }
    }

    private renderBoundingVolume(tilesetjson: any): Entity | undefined {
        const rootBoundingVolume = tilesetjson.root.boundingVolume;
        const rootTransform: number[] = tilesetjson.root.transform;
        let boundingVolumeEntity: Entity | undefined;
        if (rootBoundingVolume.box) {
            const matrix4 = Matrix4.fromArray(rootTransform);
            const localcenter = new Cartesian3();
            const boxcenter = new Cartesian3(
                rootBoundingVolume.box[0],
                rootBoundingVolume.box[1],
                rootBoundingVolume.box[2]
            );
            const localboxcenter = Cartesian3.add(
                localcenter,
                boxcenter,
                new Cartesian3()
            );
            const worldCenter = Matrix4.multiplyByPoint(
                matrix4,
                localboxcenter,
                new Cartesian3()
            );
            const worldOrientation = Quaternion.fromRotationMatrix(
                Matrix4.getMatrix3(matrix4, new Matrix3())
            );

            const box = this.viewer?.entities.add({
                position: worldCenter,
                orientation: worldOrientation,
                box: {
                    dimensions: new Cartesian3(
                        2 * rootBoundingVolume.box[3],
                        2 * rootBoundingVolume.box[7],
                        2 * rootBoundingVolume.box[11]
                    ),
                    material: Color.RED.withAlpha(0.4),
                    outline: true,
                    outlineColor: Color.YELLOW
                }
            });

            boundingVolumeEntity = box;
            this.viewer?.flyTo(box as Entity);
        }
        return boundingVolumeEntity;
    }

    handleYjsElementsEvents(
        events: Y.YEvent<any>[],
        transactions: Y.Transaction
    ) {
        // change cesium entity
        console.log("TRANSACTION is: ", transactions);
        events.map((e) => {
            console.log("Events is: ", e);
            e.changes.keys.forEach((change, key) => {
                console.log(
                    "This change's key: ",
                    key,
                    "value: ",
                    e.target.get(key),
                    "action: ",
                    change.action
                );
                if (change.action === "add") {
                    // this.emit("element:add", [key]);
                    const elementAdded = this.elements
                        .get(key)
                        ?.toJSON() as Element; // 应该有更好的获取方法
                    let entity;
                    switch (elementAdded.type) {
                        case "point":
                            entity = generatePointEntityfromElement(
                                elementAdded as GeoOasisPointElement
                            );
                            break;
                        case "polyline":
                            entity = generatePolylineEntityfromElement(
                                elementAdded as GeoOasisPolylineElement
                            );
                            break;
                        case "polygon":
                            entity = generatePolygonEntityfromElement(
                                elementAdded as GeoOasisPolygonElement
                            );
                            break;
                        case "model":
                            entity = generateModelEntityfromElement(
                                elementAdded as GeoOasisModelElement
                            );
                            break;
                        case "image":
                            entity = generateRectangleEntityfromElement(
                                elementAdded as GeoOasisImageElement
                            );
                            break;
                        case "rectangle":
                            entity = generateRectangleEntityfromElement(
                                elementAdded as GeoOasisRectangleElement
                            );
                            break;
                    }
                    if (entity) {
                        this.viewer?.entities.add(entity);
                        this.entities.set(entity.id, entity);
                        // * 默认开启callback property
                        this.startEdit(elementAdded.id, elementAdded.type);
                    }
                } else if (change.action === "delete") {
                    this.entities.delete(key);
                    this.viewer?.entities.removeById(key);
                } else if (change.action === "update") {
                    const elementMutated = e.target;
                    const updateVal = elementMutated.get(key);
                    const entityMutated = this.entities.get(
                        elementMutated.get("id")
                    ) as Entity;
                    if (
                        key === "name" ||
                        key === "description" ||
                        key === "show"
                    ) {
                        // @ts-ignore
                        entityMutated[key] = updateVal;
                    }
                    switch (elementMutated.get("type")) {
                        case "point":
                            if (key === "name") {
                                (
                                    entityMutated.label
                                        ?.text as ConstantProperty
                                ).setValue(updateVal);
                            } else if (key === "color") {
                                (
                                    entityMutated.point
                                        ?.color as ConstantProperty
                                ).setValue(Color.fromCssColorString(updateVal));
                            } else if (key === "positions") {
                                // positions属性不要修改给entityMutated，因为callbackproperty和Y.Map关联
                            } else {
                                // @ts-ignore
                                entityMutated.point[key] = updateVal;
                            }
                            break;
                        case "polyline":
                            // @ts-ignore
                            // positions属性不要修改给entityMutated，因为callbackproperty和Y.Map关联
                            // entityMutated.polyline[key] = updateVal;
                            break;
                        case "polygon":
                            // polygon与polyline类似
                            break;
                        case "model":
                            // positions属性不要修改给entityMutated，因为callbackproperty和Y.Map关联
                            // orientation属不要修改给entityMutated，因为callbackproperty和Y.Map关联
                            break;
                        case "image":
                            break;
                    }
                }
            });
        });
    }

    handleYjsLayersEvents(
        events: Y.YEvent<any>[],
        transactions: Y.Transaction
    ) {
        console.log("TRANSACTION is: ", transactions);
        events.map((e) => {
            console.log("Events is: ", e);
            e.changes.keys.forEach((change, key) => {
                console.log(`this change's key is ${key}`);
                if (change.action === "add") {
                    this.addLayerToCesium(
                        this.layers.get(key)?.toJSON() as Layer
                    );
                } else if (change.action === "update") {
                } else if (change.action === "delete") {
                    if (this.imageryLayersMap.has(key)) {
                        const layer = this.imageryLayersMap.get(key);
                        this.viewer?.imageryLayers.remove(
                            layer as ImageryLayer
                        );
                        this.imageryLayersMap.delete(key);
                    }
                    if (this.cesium3dtilesLayersMap.has(key)) {
                        const layer = this.cesium3dtilesLayersMap.get(key);
                        this.viewer?.scene.primitives.remove(layer);
                        this.cesium3dtilesLayersMap.delete(key);
                    }
                    if (this.serviceLayersMap.has(key)) {
                        // TODO: use cesium's associated array.
                        const layer = this.serviceLayersMap.get(key);
                        this.viewer?.dataSources.remove(layer as DataSource);
                        this.serviceLayersMap.delete(key);
                        this.serviceLayersArray =
                            this.serviceLayersArray.filter(
                                ([id, dataSource]) => {
                                    return dataSource !== layer;
                                }
                            );
                    }
                }
            });
        });
    }
}
