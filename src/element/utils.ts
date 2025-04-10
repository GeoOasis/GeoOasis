import {
    Cartesian3,
    Color,
    Entity,
    HeadingPitchRoll,
    // HeightReference,
    ImageMaterialProperty,
    LabelStyle,
    VerticalOrigin,
    Rectangle,
    Transforms,
    Cartesian2
} from "cesium";
import * as Y from "yjs";
import {
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement,
    GeoOasisPolygonElement,
    GeoOasisImageElement,
    GeoOasisRectangleElement
} from "./element";
import { Point3 } from "./types";
import { Editor } from "../editor/editor";

export const generatePointEntity = (
    ele: Y.Map<any> | GeoOasisPointElement
): Entity => {
    const id = ele instanceof Y.Map ? ele.get("id") : ele.id;
    const name = ele instanceof Y.Map ? ele.get("name") : ele.name;
    const show = ele instanceof Y.Map ? ele.get("show") : ele.show;
    const pixelSize =
        ele instanceof Y.Map ? ele.get("pixelSize") : ele.pixelSize;
    const positions =
        ele instanceof Y.Map ? ele.get("positions") : ele.positions;

    if (!positions || positions.length === 0) {
        throw new Error("No positions found");
    }
    const poi = positions[0];

    return new Entity({
        id,
        name,
        show,
        position: Cartesian3.fromElements(poi.x, poi.y, poi.z),
        point: {
            // heightReference: HeightReference.CLAMP_TO_GROUND,
            pixelSize: pixelSize
        },
        label: {
            text: name,
            font: "14pt monospace",
            style: LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: VerticalOrigin.BOTTOM,
            pixelOffset: new Cartesian2(0, -9)
            // heightReference: HeightReference.CLAMP_TO_GROUND
        }
    });
};

export const generatePolylineEntity = (
    ele: Y.Map<any> | GeoOasisPolylineElement
): Entity => {
    const id = ele instanceof Y.Map ? ele.get("id") : ele.id;
    const name = ele instanceof Y.Map ? ele.get("name") : ele.name;
    const show = ele instanceof Y.Map ? ele.get("show") : ele.show;
    const positions =
        ele instanceof Y.Map ? ele.get("positions") : ele.positions;
    const width = ele instanceof Y.Map ? ele.get("width") : ele.width;
    if (!positions || positions.length === 0) {
        throw new Error("No positions found");
    }
    return new Entity({
        id,
        name,
        show,
        polyline: {
            width,
            positions: positions.map((p: Point3) => cartesian3FromPoint3(p)),
            clampToGround: true
        }
    });
};

export const generatePolygonEntity = (
    ele: Y.Map<any> | GeoOasisPolygonElement
): Entity => {
    const id = ele instanceof Y.Map ? ele.get("id") : ele.id;
    const name = ele instanceof Y.Map ? ele.get("name") : ele.name;
    const show = ele instanceof Y.Map ? ele.get("show") : ele.show;
    const positions =
        ele instanceof Y.Map ? ele.get("positions") : ele.positions;
    if (!positions || positions.length === 0) {
        throw new Error("No positions found");
    }
    return new Entity({
        id,
        name,
        show,
        polygon: {
            hierarchy: positions.map((p: Point3) => cartesian3FromPoint3(p)),
            material: Color.WHITE
        }
    });
};

export const generateModelEntity = async (
    element: Y.Map<any> | GeoOasisModelElement,
    editor: Editor
): Promise<Entity> => {
    const id = element instanceof Y.Map ? element.get("id") : element.id;
    const name = element instanceof Y.Map ? element.get("name") : element.name;
    const show = element instanceof Y.Map ? element.get("show") : element.show;
    const positions =
        element instanceof Y.Map ? element.get("positions") : element.positions;
    const scale =
        element instanceof Y.Map ? element.get("scale") : element.scale;
    const orientation =
        element instanceof Y.Map
            ? element.get("orientation")
            : element.orientation;
    const assetId =
        element instanceof Y.Map ? element.get("assetId") : element.assetId;
    if (!positions || positions.length === 0) {
        throw new Error("No positions found");
    }
    const poi = positions[0];
    const center = Cartesian3.fromElements(poi.x, poi.y, poi.z);
    const uri = await editor.assetLibrary.getAssetUrl(assetId);
    return new Entity({
        id,
        name,
        show,
        position: center,
        orientation: Transforms.headingPitchRollQuaternion(
            center,
            new HeadingPitchRoll(
                orientation?.heading,
                orientation?.pitch,
                orientation?.roll
            )
        ),
        model: {
            uri,
            scale: scale?.x
            // minimumPixelSize: 128,
            // maximumScale: 20000,
        }
    });
};

export const generateRectangleEntity = (
    ele: Y.Map<any> | GeoOasisImageElement | GeoOasisRectangleElement
): Entity => {
    const id = ele instanceof Y.Map ? ele.get("id") : ele.id;
    const name = ele instanceof Y.Map ? ele.get("name") : ele.name;
    const show = ele instanceof Y.Map ? ele.get("show") : ele.show;
    const positions =
        ele instanceof Y.Map ? ele.get("positions") : ele.positions;
    const type = ele instanceof Y.Map ? ele.get("type") : ele.type;
    if (!positions || positions.length === 0) {
        throw new Error("No positions found");
    }

    let material;
    if (type === "image") {
        // @ts-ignore
        const url = ele instanceof Y.Map ? ele.get("url") : ele.url;
        if (typeof url === "string") {
            material = url;
        } else {
            // @ts-ignore
            const blob = new Blob([url], { type: "image/png" });
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
    }
    return new Entity({
        id,
        name,
        show,
        rectangle: {
            coordinates: Rectangle.fromCartesianArray(
                positions.map((p: Point3) => cartesian3FromPoint3(p))
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
