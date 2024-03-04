import {
    Element,
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement
} from "../element/element";
import { Entity, Viewer, CallbackProperty } from "cesium";

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

const generateModelEntityfromElement = (
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

// Editor is singleton
export class Editor {
    // TODO 考虑是否还需要数组保存elements和entities，似乎原生的entityCollection已经可以替代了
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
            case "model":
                entity = generateModelEntityfromElement(
                    element as GeoOasisModelElement
                );
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
            case "model":
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
            case "model":
                break;
        }
    }

    getElement(id: string) {
        return this.elementsMap.get(id);
    }

    getEntity(id: string) {
        return this.entitiesMap.get(id);
    }

    onChange() {
        // TODO 每次修改element的时候就调用这个函数，
        // param: ElementRef
        //
        // ElementRef = this.elements
    }
}
