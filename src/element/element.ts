import { nanoid } from "nanoid";
import { Cartesian3 } from "cesium";

export type Element =
    | GeoOasisPointElement
    | GeoOasisPolylineElement
    | GeoOasisPolygonElement;

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

export interface GeoOasisPolygonElement extends GeoOasisBaseElement {
    type: "polygon";
    positions: number[];
}

export interface GeoOasisImageElement extends GeoOasisBaseElement {
    type: "image";
    url: string;
}

export interface GeoOasisModelElement extends GeoOasisBaseElement {
    type: "model";
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
