import { nanoid } from "nanoid";
import { Cartesian3 } from "cesium";
import {
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement,
    GeoOasisPolygonElement
} from "./element";
import { point3FromCartesian3 } from "./utils";

// TODO defaultValue 设置
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
        description: "",
        positions: [
            {
                x: position.x,
                y: position.y,
                z: position.z
            }
        ],
        pixelSize: 10,
        color: "white"
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
        description: "",
        width: 5,
        positions: positions.map((p) => point3FromCartesian3(p))
    };
};

export const newPolygonElement = (
    id: string,
    name: string,
    show: boolean,
    positions: Cartesian3[]
): GeoOasisPolygonElement => {
    return {
        id: nanoid(),
        type: "polygon",
        name,
        show,
        description: "",
        positions: positions.map((p) => point3FromCartesian3(p))
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
        description: "",
        positions: [
            {
                x: position.x,
                y: position.y,
                z: position.z
            }
        ],
        url
    };
};
