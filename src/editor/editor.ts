import {
    Entity,
    Viewer,
    CallbackProperty,
    Cartesian2,
    Cartesian3,
    Matrix4,
    Color,
    DataSource,
    Cesium3DTileset,
    GeoJsonDataSource,
    PolygonHierarchy,
    Transforms,
    HeadingPitchRoll,
    ConstantProperty,
    IonResource,
    Quaternion,
    Matrix3,
    CallbackPositionProperty
} from "cesium";
import * as Y from "yjs";
import { ObservableV2 } from "lib0/observable.js";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { nanoid } from "nanoid";
import { createHocuspocusProvider } from "./provider";
import { Element, ElementKV } from "../element/element";
import {
    cartesian3FromPoint3,
    generatePointEntity,
    generatePolylineEntity,
    generatePolygonEntity,
    generateModelEntity,
    generateRectangleEntity
} from "../element/utils";
import { Point3 } from "../element/types";
import {
    GeoOasis3DTilesLayer,
    Layer,
    GeoOasisServiceLayer
} from "../layer/layer";
import { Hocuspocus_URL } from "../contants";
import { AssetLibrary } from "./assetLibrary";
import { ImageryLayerManager } from "./imageryLayerManager";
import { PrimitiveCollection2 } from "../scene/PrimitiveCollection2";
import { getYMapValues } from "./utils";
import { ToolBox } from "../tool/ToolBox";
import { setTerrain, TerrainOption } from "./terrain";

export type EditorEvent = {
    "element:add": (key: string) => void;
    "element:update": () => void;
    "element:delete": () => void;
};

export interface BaseEditor {
    // Element
    pickElement(position: Cartesian2): Element | undefined;
    getElement(id: Element["id"]): Element | undefined;
    addElement(element: Element): void;
    deleteElement(id: Element["id"]): void;
    mutateElement(id: Element["id"], update: { [key: string]: any }): void;

    startEdit(id: Element["id"], type: Element["type"]): void;
    stopEdit(id: Element["id"], type: Element["type"]): void;

    // Layer
    pickLayer(position: Cartesian2): Layer | undefined;
    setBaseLayer(name: string): void;
    getLayer(id: Layer["id"]): Layer | undefined;
    addLayer(layer: Layer): void;
    getLayerData(id: Layer["id"]): any;
    deleteLayer(id: Layer["id"], type?: Layer["type"]): void;

    // Room
    changeRoom(roomId?: string): string;
    disconnectProvider(): void;

    // Other
    attachViewer(viewer: Viewer): void;
}

// Editor is singleton
export class Editor extends ObservableV2<EditorEvent> implements BaseEditor {
    private doc: Y.Doc;
    public title: Y.Text;
    public options: Y.Map<any>;
    public elements: Y.Map<Y.Map<any>>; // how to use correct type? don't use Map
    public layers: Y.Map<Y.Map<any>>;
    public baseLayers: Y.Map<Y.Map<any>>;
    public undoManager: Y.UndoManager;

    public assetLibrary: AssetLibrary;
    public imageryLayerManager: ImageryLayerManager;

    public toolBox?: ToolBox;

    private netWorkProvider?: HocuspocusProvider;

    // TODO: 减少状态
    public viewer?: Viewer;
    private entities: Map<string, Entity> = new Map();
    public cameraPrimitivesCollection: PrimitiveCollection2 =
        new PrimitiveCollection2();
    private serviceLayersMap: Map<Layer["id"], DataSource> = new Map();
    private serviceLayersArray: [Layer["id"], DataSource][] = new Array();
    private cesium3dtilesLayersMap: Map<Layer["id"], Cesium3DTileset> =
        new Map();

    constructor() {
        super();
        this.doc = new Y.Doc();
        this.title = this.doc.getText("title");
        this.options = this.doc.getMap("options");
        this.options.set("terrain", TerrainOption.ELLIPSOID);
        new IndexeddbPersistence("oasis-doc", this.doc);
        this.elements = this.doc.getMap("ElementsMap");
        this.layers = this.doc.getMap("LayersMap");
        this.baseLayers = this.doc.getMap("BaseLayersMap");
        this.assetLibrary = new AssetLibrary(this.doc);
        const yArr = this.doc.getArray("yImageryLayers");
        const yMap = this.doc.getMap("yBaseImageryLayers");
        this.imageryLayerManager = new ImageryLayerManager(yArr, yMap);
        this.undoManager = new Y.UndoManager([
            this.elements,
            this.layers,
            yArr
        ]);
        this.init();
    }

    get provider() {
        return this.netWorkProvider;
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
        this.options.observe((event) => {
            event.keysChanged.forEach((key) => {
                if (key === "terrain") {
                    const optionTerrain = this.options.get(
                        key
                    ) as TerrainOption;
                    if (this.viewer) {
                        setTerrain(this.viewer, optionTerrain);
                    }
                }
            });
        });
    }

    attachViewer(viewer: Viewer) {
        this.viewer = viewer;
        this.imageryLayerManager.imageryLayerCollection = viewer.imageryLayers;
        this.viewer.scene.primitives.add(this.cameraPrimitivesCollection);
        setTerrain(this.viewer, this.options.get("terrain") as TerrainOption);
    }

    // change room
    changeRoom(roomId?: string) {
        this.disconnectProvider();
        const nextId = roomId ? roomId : nanoid();
        this.netWorkProvider = createHocuspocusProvider(
            Hocuspocus_URL,
            nextId,
            this.doc
        );
        return nextId;
    }

    disconnectProvider() {
        if (this.netWorkProvider) {
            this.netWorkProvider.awareness?.destroy();
            this.netWorkProvider.removeAllListeners();
            this.netWorkProvider.disconnect();
            this.netWorkProvider.destroy();
            this.netWorkProvider = undefined;
        }
    }

    setTerrain(terrain: TerrainOption) {
        this.options.set("terrain", terrain);
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
                entity.position = new CallbackPositionProperty(() => {
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
                if (entity.model) {
                    entity.model.scale = new CallbackProperty(() => {
                        return this.elements.get(id)?.get("scale").x;
                    }, false);
                }
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

    getElementAttribute<K extends keyof ElementKV>(
        id: Element["id"],
        key: K
    ): ElementKV[K] {
        return this.elements.get(id)?.get(key);
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
        console.log("picked!!!!!!!!!!!!", pickedEntity);
        if (pickedEntity) {
            return this.elements.get(pickedEntity.id.id)?.toJSON() as Element;
        }
        return undefined;
    }

    // this method can't pick ImageryLayer.
    pickLayer(position: Cartesian2) {
        const pickedEntity = this.viewer?.scene.pick(position);
        if (pickedEntity) {
            const entity = pickedEntity.id;
            const entityCollection = entity.entityCollection;
            const owner = entityCollection.owner;
            // console.log("ower:", owner);
            const found = this.serviceLayersArray.find(
                ([_layerId, dataSource]) => {
                    return dataSource === owner;
                }
            );
            console.log("layerfound", found);
            const pickedId = found?.[0];
            if (pickedId) {
                const layer = this.layers.get(pickedId)?.toJSON() as Layer;
                // console.log(layer);
                return layer;
            }
        }
        return undefined;
    }

    getLayerData(id: Layer["id"]) {
        // TODO
        return this.layers.get(id)?.get("url");
    }

    getLayer(id: Layer["id"]): Layer | undefined {
        if (!this.layers.has(id)) {
            const info = this.imageryLayerManager.getLayerInfo(id);
            return info;
        }
        // @ts-ignore
        const { url, ...rest } = this.layers.get(id)?.toJSON();
        return rest as Layer;
    }

    addLayer(layer: Layer) {
        if (layer.type === "imagery") {
            this.imageryLayerManager.addLayer(layer);
            return;
        }
        const layerMap = new Y.Map();
        for (const [key, value] of Object.entries(layer)) {
            layerMap.set(key, value);
        }
        this.layers.set(layer.id, layerMap);
    }

    deleteLayer(id: Layer["id"]): void {
        this.imageryLayerManager.deleteLayer(id);
        this.layers.delete(id);
    }

    mutateLayer(id: string, update: { [key: string]: any }): void {
        const layer = this.layers.get(id);
        for (const [key, value] of Object.entries(update)) {
            layer?.set(key, value);
        }
    }

    // the index of baseLayer is always 0 in the viewer.imageryLayers.
    setBaseLayer(name: string) {
        this.imageryLayerManager.setBaseLayer(name);
    }

    private async add3dtilesLayer(
        id: Layer["id"],
        url: GeoOasis3DTilesLayer["url"],
        ion: GeoOasis3DTilesLayer["ion"]
    ) {
        const cesium3dtiles = await create3dtilesLayer(url, ion);
        this.viewer?.scene.primitives.add(cesium3dtiles);
        this.cesium3dtilesLayersMap.set(id, cesium3dtiles);
        await this.viewer?.zoomTo(cesium3dtiles);
    }

    handleYjsElementsEvents(
        events: Y.YEvent<any>[],
        transactions: Y.Transaction
    ) {
        // change cesium entity
        console.log("TRANSACTION is: ", transactions);
        for (const e of events) {
            console.log("Events is: ", e);
            e.changes.keys.forEach(async (change, key) => {
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
                    const eleYMap = this.elements.get(key);
                    if (!eleYMap) return;

                    const { id, type } = getYMapValues<Element>(eleYMap, [
                        "id",
                        "type"
                    ]);
                    let entity;
                    switch (type) {
                        case "point":
                            entity = generatePointEntity(eleYMap);
                            break;
                        case "polyline":
                            entity = generatePolylineEntity(eleYMap);
                            break;
                        case "polygon":
                            entity = generatePolygonEntity(eleYMap);
                            break;
                        case "model":
                            entity = await generateModelEntity(eleYMap, this);
                            break;
                        case "image":
                            entity = generateRectangleEntity(eleYMap);
                            break;
                        case "rectangle":
                            entity = generateRectangleEntity(eleYMap);
                            break;
                    }
                    if (entity) {
                        this.viewer?.entities.add(entity);
                        this.entities.set(id, entity);
                        // * 默认开启callback property
                        this.startEdit(id, type);
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
        }
    }

    handleYjsLayersEvents(
        events: Y.YEvent<any>[],
        transactions: Y.Transaction
    ) {
        console.log("TRANSACTION is: ", transactions);
        for (const e of events) {
            console.log("Events is: ", e);
            e.changes.keys.forEach(async (change, key) => {
                console.log(`this change's key is ${key}`);
                if (change.action === "add") {
                    const layerYMap = this.layers.get(key);
                    if (!layerYMap) {
                        return;
                    }
                    const { id, type } = getYMapValues<Layer>(layerYMap, [
                        "id",
                        "type"
                    ]);
                    switch (type) {
                        case "service":
                            const { provider, url } =
                                getYMapValues<GeoOasisServiceLayer>(layerYMap, [
                                    "provider",
                                    "url"
                                ]);
                            let layer;
                            switch (provider) {
                                case "geojson":
                                    const geojsonDataSource =
                                        await GeoJsonDataSource.load(url, {
                                            markerSize: 12
                                        });
                                    layer = geojsonDataSource;
                                    break;
                                case "gpx":
                                case "kml":
                                case "czml":
                                case "custom":
                            }
                            if (layer) {
                                this.viewer?.dataSources.add(layer);
                                this.serviceLayersMap.set(id, layer);
                                this.serviceLayersArray.push([id, layer]);
                            }
                            break;
                        case "3dtiles":
                            const {
                                url: urlTmp,
                                ion,
                                tileset
                            } = getYMapValues<GeoOasis3DTilesLayer>(layerYMap, [
                                "url",
                                "ion",
                                "tileset"
                            ]);
                            try {
                                const tilesetJson = await fetch3DTilesetJson(
                                    urlTmp,
                                    ion
                                );
                                if (!tileset) {
                                    // cache tileset.josn
                                    this.layers
                                        .get(id)
                                        ?.set("tileset", tilesetJson);
                                }
                                await this.add3dtilesLayer(id, urlTmp, ion);
                            } catch (error) {
                                const tilesetJson = this.layers
                                    .get(id)
                                    ?.get("tileset");
                                let boundingVolumeEntity: Entity;
                                if (tilesetJson && this.viewer) {
                                    boundingVolumeEntity = renderBoundingVolume(
                                        tilesetJson,
                                        this.viewer
                                    );
                                }
                                retryAsync(
                                    async () => {
                                        await this.add3dtilesLayer(
                                            id,
                                            urlTmp,
                                            ion
                                        );
                                    },
                                    10,
                                    10000
                                ).then(() => {
                                    this.viewer?.entities.remove(
                                        boundingVolumeEntity
                                    );
                                });
                                console.error(error);
                            }
                            break;
                        case "terrain":
                            break;
                    }
                } else if (change.action === "delete") {
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
                                ([_id, dataSource]) => {
                                    return dataSource !== layer;
                                }
                            );
                    }
                } else if (change.action === "update") {
                }
            });
        }
    }
}

async function create3dtilesLayer(
    url: GeoOasis3DTilesLayer["url"],
    ion: GeoOasis3DTilesLayer["ion"]
) {
    try {
        if (ion) {
            return await Cesium3DTileset.fromIonAssetId(Number(url));
        } else {
            return await Cesium3DTileset.fromUrl(url);
        }
    } catch (error) {
        throw new Error(`Error creating tileset: ${error}`);
    }
}

async function fetch3DTilesetJson(
    url: GeoOasis3DTilesLayer["url"],
    ion: GeoOasis3DTilesLayer["ion"]
) {
    try {
        let resource;
        if (ion) {
            resource = await IonResource.fromAssetId(Number(url));
        } else {
            resource = url;
        }
        const tilesetJson = await Cesium3DTileset.loadJson(resource);
        return tilesetJson;
    } catch (error) {
        throw error;
    }
}

function renderBoundingVolume(tilesetjson: any, viewer: Viewer): Entity {
    const rootBoundingVolume = tilesetjson.root.boundingVolume;
    const rootTransform: number[] = tilesetjson.root.transform;
    let boundingVolumeEntity: Entity = {} as Entity;
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

        const box = viewer.entities.add({
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
        viewer.flyTo(box as Entity);
    }
    return boundingVolumeEntity;
}

async function retryAsync(
    functionToRetry: () => Promise<any>,
    maxRetries = 3,
    delay = 1000
) {
    async function retry(attempt: number) {
        try {
            return await functionToRetry();
        } catch (error) {
            if (attempt <= maxRetries) {
                console.log(`Attempt ${attempt} failed. Retrying...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return await retry(attempt + 1);
            } else {
                throw error;
            }
        }
    }
    return await retry(1);
}
