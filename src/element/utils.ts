import { Cartesian3, Entity } from "cesium";
import {
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement
} from "./element";
import { Point3 } from "./point";

export const generatePointEntityfromElement = (
    element: GeoOasisPointElement
): Entity => {
    const poi = element.position;
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        position: Cartesian3.fromElements(poi.x, poi.y, poi.z),
        point: {
            pixelSize: element.pixelSize
        }
    });
};

export const generatePolylineEntityfromElement = (
    element: GeoOasisPolylineElement
): Entity => {
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        polyline: {
            width: element.width,
            positions: element.positions.map((p) => cartesian3FromPoint3(p))
        }
    });
};

export const generateModelEntityfromElement = (
    element: GeoOasisModelElement
): Entity => {
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        position: element.position,
        model: {
            uri: element.url,
            minimumPixelSize: 128,
            maximumScale: 20000
        }
    });
};

export function cartesian3FromPoint3(point: Point3) {
    return new Cartesian3(point.x, point.y, point.z);
}

export function point3FromCartesian3(cartesian: Cartesian3) {
    return {
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z
    };
}
