import {
    Cartesian3,
    Color,
    Entity,
    ImageMaterialProperty,
    Rectangle
} from "cesium";
import {
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement,
    GeoOasisPolygonElement,
    GeoOasisImageElement
} from "./element";
import { Point3 } from "./point";

export const generatePointEntityfromElement = (
    element: GeoOasisPointElement
): Entity => {
    const poi = element.positions[0];
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

export const generatePolygonEntityfromElement = (
    element: GeoOasisPolygonElement
): Entity => {
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        polygon: {
            hierarchy: element.positions.map((p) => cartesian3FromPoint3(p)),
            material: Color.WHITE
        }
    });
};

export const generateModelEntityfromElement = (
    element: GeoOasisModelElement
): Entity => {
    const poi = element.positions[0];
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        position: Cartesian3.fromElements(poi.x, poi.y, poi.z),
        model: {
            uri: element.url,
            minimumPixelSize: 128,
            maximumScale: 20000
        }
    });
};

export const generateRectangleEntityfromElement = (
    element: GeoOasisImageElement
): Entity => {
    let material;
    if (typeof element.url === "string") {
        material = element.url;
    } else {
        // @ts-ignore
        const blob = new Blob([element.url.buffer], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        const imageHTMLElement = document.createElement("img");
        imageHTMLElement.src = url;
        imageHTMLElement.onload = () => {
            URL.revokeObjectURL(url);
        };
        material = new ImageMaterialProperty({
            image: imageHTMLElement
        });
    }
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        rectangle: {
            coordinates: Rectangle.fromCartesianArray(
                element.positions.map((p) => cartesian3FromPoint3(p))
            ),
            // @ts-ignore
            material: material
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
