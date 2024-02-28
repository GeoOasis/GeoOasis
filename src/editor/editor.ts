import {
    Element,
    GeoOasisPointElement,
    GeoOasisPolylineElement
} from "../element/element";
import { Entity, Viewer } from "cesium";

const generatePointEntityfromElement = (
    element: GeoOasisPointElement
): Entity => {
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        position: element.position,
        point: {
            pixelSize: 10
        }
    });
};

const generatePolylineEntityfromElement = (
    element: GeoOasisPolylineElement
): Entity => {
    return new Entity({
        id: element.id,
        name: element.name,
        show: element.show,
        polyline: {
            positions: element.positions
        }
    });
};

// Editor is singleton
export class Editor {
    // 后续考虑是否使用Map来保存
    // elements 保存所有的元素 在APP中相当于响应式状态
    private elements: Element[] = [];
    // entities 保存元素对应的实体
    private entities: Entity[] = [];

    private elementsMap: Map<Element["id"], Element> = new Map();
    private entitiesMap: Map<Element["id"], Entity> = new Map();

    viewer: Viewer = {} as Viewer;

    addElement(element: Element) {
        this.elements.push(element);
        this.elementsMap.set(element.id, element);
        let entity;
        switch (element.type) {
            case "point":
                entity = generatePointEntityfromElement(
                    element as GeoOasisPointElement
                );
                break;
            case "polyline":
                entity = generatePolylineEntityfromElement(
                    element as GeoOasisPolylineElement
                );
                break;
            case "polygon":
                break;
        }
        if (entity) {
            this.viewer.entities.add(entity);
            this.entitiesMap.set(element.id, entity);
            this.entities.push(entity);
        }
    }

    startEdit(id: string, type: string) {
        let entity = this.entitiesMap.get(id);
        switch (type) {
            case "point":
                break;
            case "polyline":
                //@ts-ignore
                entity.polyline.positions = new CallbackProperty(() => {
                    //@ts-ignore
                    return this.elementsMap.get(id).positions;
                }, false);
                break;
            case "polygon":
                break;
        }
    }

    stopEdit(id: string, type: string) {
        let entity = this.entitiesMap.get(id);
        switch (type) {
            case "point":
                break;
            case "polyline":
                // 若要阻止闪烁，可能需要再渲染一个entity
                //@ts-ignore
                entity.polyline.positions = this.elementsMap.get(id).positions;
                break;
            case "polygon":
                break;
        }
    }

    getElement(id: string) {
        return this.elementsMap.get(id);
    }

    getEntity(id: string) {
        return this.entitiesMap.get(id);
    }
}
