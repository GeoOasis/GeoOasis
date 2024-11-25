export type Layer =
    | GeoOasisImageryLayer
    | GeoOasisTerrainLayer
    | GeoOasisImageryLayer
    | GeoOasisServiceLayer
    | GeoOasis3DTilesLayer;

export interface GeoOasisBaseLayer {
    id: string;
    name: string;
}

export interface GeoOasisImageryLayer extends GeoOasisBaseLayer {
    type: "imagery";
    provider:
        | "bing"
        | "arcgis"
        | "osm"
        | "st"
        | "tms"
        | "wms"
        | "wmts"
        | "singleTile"
        | "custom";
    show: boolean;
    url?: string;
    credit?: string;
    layer?: string;
    parameters?: any;
}

export interface GeoOasisTerrainLayer extends GeoOasisBaseLayer {
    type: "terrain";
    show: boolean;
}

// 非Base类型的Layer可以用来做空间分析
export interface GeoOasisServiceLayer extends GeoOasisBaseLayer {
    type: "service";
    provider: "geojson" | "gpx" | "kml" | " czml" | "custom";
    url: string | Object;
    show: boolean;
}

export interface GeoOasis3DTilesLayer extends GeoOasisBaseLayer {
    type: "3dtiles";
    url: string;
    tileset?: any;
    ion?: boolean;
    show: boolean;
}
