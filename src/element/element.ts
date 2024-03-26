import { Cartesian3 } from "cesium";
import { Point3 } from "./point";

export type Element =
    | GeoOasisPointElement
    | GeoOasisPolylineElement
    | GeoOasisPolygonElement
    | GeoOasisModelElement;

export interface GeoOasisBaseElement {
    id: string;
    name: string;
    show: boolean;
    type: string;
    description: string;
    // position: number[]; // 对于rectangle，point有用
    // posiitons: number[]; // 对于polyline有用
}

// points, billboards, labels
export interface GeoOasisPointElement extends GeoOasisBaseElement {
    type: "point";
    position: Point3;
    pixelSize: number;
    color: string;
}

export interface GeoOasisLabelElement extends GeoOasisBaseElement {
    type: "label";
    position: Cartesian3;
}

export interface GeoOasisPolylineElement extends GeoOasisBaseElement {
    type: "polyline";
    positions: Point3[];
    // width: number;
    // material: string;
    // clampToGround: boolean;
    // zIndex: number;
}
// entity中 polygon可以实现rectangle
export interface GeoOasisPolygonElement extends GeoOasisBaseElement {
    type: "polygon";
    positions: number[];
}

export interface GeoOasisRectangleElement extends GeoOasisBaseElement {
    type: "rectangle";
    positions: number[];
}

export interface GeoOasisImageElement extends GeoOasisBaseElement {
    type: "image";
    positions: number[];
    url: string;
}

// model可以扩展自point，使用orientation和scale来控制
// orientation是每个entity都有配置
export interface GeoOasisModelElement extends GeoOasisBaseElement {
    type: "model";
    position: Cartesian3;
    url: string;
}
