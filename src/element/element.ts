import { Point3 } from "./types";

export type Element =
    | GeoOasisPointElement
    | GeoOasisPolylineElement
    | GeoOasisPolygonElement
    | GeoOasisModelElement
    | GeoOasisImageElement
    | GeoOasisRectangleElement;

export type ElementProperties = [keyof Element, Element[keyof Element]][];

export interface GeoOasisBaseElement {
    id: string;
    name: string;
    show: boolean;
    type: string;
    description: string;
    positions: Point3[];
    orientation?: {
        heading: number;
        pitch: number;
        roll: number;
    };
    scale?: Point3;
}

// points, billboards, labels
export interface GeoOasisPointElement extends GeoOasisBaseElement {
    type: "point";
    pixelSize: number;
    color: string;
}

export interface GeoOasisLabelElement extends GeoOasisBaseElement {
    type: "label";
}

export interface GeoOasisPolylineElement extends GeoOasisBaseElement {
    type: "polyline";
    width: number;
    // material: string;
    // clampToGround: boolean;
    // zIndex: number;
}
// entity中 polygon可以实现rectangle
export interface GeoOasisPolygonElement extends GeoOasisBaseElement {
    type: "polygon";
}

export interface GeoOasisRectangleElement extends GeoOasisBaseElement {
    type: "rectangle";
}

// YMap 's value cannot be ArrayBuffer
export interface GeoOasisImageElement extends GeoOasisBaseElement {
    type: "image";
    url: string | Uint8Array; //image/png base64/Uint8Array
}

// model可以扩展自point，使用orientation和scale来控制
// orientation是每个entity都有配置
export interface GeoOasisModelElement extends GeoOasisBaseElement {
    type: "model";
    url: string;
    data?: any;
}
