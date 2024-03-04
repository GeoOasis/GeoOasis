import { nanoid } from "nanoid";
import { Cartesian3 } from "cesium";

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
    // position: number[]; // 对于rectangle，point有用
    // posiitons: number[]; // 对于polyline有用
}

export interface GeoOasisPointElement extends GeoOasisBaseElement {
    type: "point";
    position: Cartesian3;
}

export interface GeoOasisPolylineElement extends GeoOasisBaseElement {
    type: "polyline";
    positions: Cartesian3[];
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

export const newPointElement = (
    id: string,
    name: string,
    show: boolean,
    position: Cartesian3
): GeoOasisPointElement => {
    return {
        id: nanoid(),
        type: "point",
        name,
        show,
        position
    };
};

export const newPolylineElement = (
    id: string,
    name: string,
    show: boolean,
    positions: Cartesian3[]
): GeoOasisPolylineElement => {
    return {
        id: nanoid(),
        type: "polyline",
        name,
        show,
        positions
    };
};

export const newModelElement = (
    id: string,
    name: string,
    show: boolean,
    position: Cartesian3,
    url: string
): GeoOasisModelElement => {
    return {
        id: nanoid(),
        type: "model",
        name,
        show,
        position,
        url
    };
};
