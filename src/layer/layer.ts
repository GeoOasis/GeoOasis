export type GeoOasisLayer =
    | GeoOasisBaseImageryLayer
    | GeoOasisBaseTerrainLayer
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
        | "custom";
    show: boolean;
    url?: string;
    credit?: string;
    layer?: string;
    parameters?: any;
}

export interface GeoOasisBaseImageryLayer extends GeoOasisImageryLayer {
    provider: "bing" | "arcgis" | "osm" | "wmts" | "tms" | "custom";
}

export interface GeoOasisBaseTerrainLayer extends GeoOasisBaseLayer {
    type: "terrain";
    show: boolean;
}

// 非Base类型的Layer可以用来做空间分析
export interface GeoOasisServiceLayer extends GeoOasisBaseLayer {
    // "gpx|kml|geojson|czml"
    type: "service";
    url: string;
    show: boolean;
}

export interface GeoOasis3DTilesLayer extends GeoOasisBaseLayer {
    type: "3dtiles";
    url: string;
    show: boolean;
}
