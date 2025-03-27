import { KV } from "../type";

export type Layer =
    | GeoOasisImageryLayer
    | GeoOasisTerrainLayer
    | GeoOasisServiceLayer
    | GeoOasis3DTilesLayer;

export type LayerKV = KV<Layer>;

export interface GeoOasisBaseLayer {
    id: string;
    name: string;
    show: boolean;
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
    url?: string;
    credit?: string;
    layer?: string;
    parameters?: any;
}

export interface GeoOasisTerrainLayer extends GeoOasisBaseLayer {
    type: "terrain";
}

// 非Base类型的Layer可以用来做空间分析
export interface GeoOasisServiceLayer extends GeoOasisBaseLayer {
    type: "service";
    provider: "geojson" | "gpx" | "kml" | " czml" | "custom";
    url: string | Object;
}

export interface GeoOasis3DTilesLayer extends GeoOasisBaseLayer {
    type: "3dtiles";
    url: string;
    tileset?: any;
    ion?: boolean;
}
