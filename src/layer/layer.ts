// base imagery layer添加到viewer.scene.globe.imageryCollection
// service layer添加到entitiesCollection中
export type GeoOasisLayer =
    | GeoOasisBaseImageryLayer
    | GeoOasisBaseTerrainLayer
    | GeoOasisServiceLayer;

export interface GeoOasisBaseLayer {
    id: string;
    name: string;
}

// TODO 不同类型的图层还要在用一个属性区分，single，wms，wmts等等，不然不好设置option
export interface GeoOasisBaseImageryLayer extends GeoOasisBaseLayer {
    type: "imagery";
    show: boolean;
}

export interface GeoOasisBaseTerrainLayer extends GeoOasisBaseLayer {
    type: "terrain";
    show: boolean;
}

export interface GeoOasisServiceLayer extends GeoOasisBaseLayer {
    // "gpx|kml|geojson|czml"
    type: "service";
    url: string;
    show: boolean;
}
