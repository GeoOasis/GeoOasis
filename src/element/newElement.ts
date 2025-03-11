import { nanoid } from "nanoid";
import { Cartesian3 } from "cesium";
import {
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement,
    GeoOasisPolygonElement,
    GeoOasisImageElement,
    GeoOasisRectangleElement
} from "./element";
import { point3FromCartesian3 } from "./utils";

export const newPointElement = (options: {
    id?: string;
    name?: string;
    show?: boolean;
    position: Cartesian3;
}): GeoOasisPointElement => {
    const { id = nanoid(), name = "default", show = true, position } = options;
    return {
        id,
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
        color: "#FFFFFF"
    };
};

export const newPolylineElement = (options: {
    id?: string;
    name?: string;
    show?: boolean;
    positions: Cartesian3[];
}): GeoOasisPolylineElement => {
    const { id = nanoid(), name = "default", show = true, positions } = options;
    return {
        id: id,
        type: "polyline",
        name,
        show,
        description: "",
        width: 5,
        positions: positions.map((p) => point3FromCartesian3(p))
    };
};

export const newPolygonElement = (options: {
    id?: string;
    name?: string;
    show?: boolean;
    positions: Cartesian3[];
}): GeoOasisPolygonElement => {
    const { id = nanoid(), name = "default", show = true, positions } = options;

    return {
        id,
        type: "polygon",
        name,
        show,
        description: "",
        positions: positions.map((p) => point3FromCartesian3(p))
    };
};

export const newModelElement = (options: {
    id?: string;
    name?: string;
    show?: boolean;
    position: Cartesian3;
    assetId: string;
    description?: string;
}): GeoOasisModelElement => {
    const {
        id = nanoid(),
        name = "",
        show = true,
        position,
        assetId,
        description = ""
    } = options;
    return {
        id,
        type: "model",
        name,
        show,
        description,
        assetId,
        positions: [
            {
                x: position.x,
                y: position.y,
                z: position.z
            }
        ],
        orientation: {
            heading: 0,
            pitch: 0,
            roll: 0
        },
        scale: {
            x: 1,
            y: 1,
            z: 1
        }
    };
};

export const newRectangleElement = (options: {
    id?: string;
    name?: string;
    show?: boolean;
    positions: Cartesian3[];
}): GeoOasisRectangleElement => {
    const { id = nanoid(), name = "default", show = true, positions } = options;
    return {
        id,
        type: "rectangle",
        name,
        show,
        description: "",
        positions: positions.map((p) => point3FromCartesian3(p))
    };
};

export const newImageElement = (options: {
    id?: string;
    name?: string;
    show?: boolean;
    extent?: {
        minLng: number;
        minLat: number;
        maxLng: number;
        maxLat: number;
    };
    url: string | Uint8Array;
}): GeoOasisImageElement => {
    const {
        id = nanoid(),
        name = "default",
        show = true,
        extent = {
            minLng: 0.0,
            minLat: 0.0,
            maxLng: 10.0,
            maxLat: 10.0
        },
        url
    } = options;
    // TODO: calculate from center
    return {
        id,
        type: "image",
        name,
        show,
        description: "",
        positions: [
            point3FromCartesian3(
                Cartesian3.fromDegrees(extent.minLng, extent.minLat)
            ),
            point3FromCartesian3(
                Cartesian3.fromDegrees(extent.maxLng, extent.maxLat)
            )
        ],
        url
    };
};
