import { Entity, Viewer, CallbackProperty, Cartesian2, Color } from "cesium";
import {
    Element,
    GeoOasisPointElement,
    GeoOasisPolylineElement,
    GeoOasisModelElement
} from "../element/element";
import {
    cartesian3FromPoint3,
    generatePointEntityfromElement,
    generatePolylineEntityfromElement,
    generateModelEntityfromElement
} from "../element/utils";

// Editor is singleton
export class Editor extends EventTarget {
    // TODO 考虑是否还需要数组保存elements和entities，似乎原生的entityCollection已经可以替代了
    // elements 保存所有的元素 在APP中相当于响应式状态
    private elements: Element[] = [];
    // entities 保存元素对应的实体
    private entities: Entity[] = [];

    private elementsMap: Map<Element["id"], Element> = new Map();
    private entitiesMap: Map<Element["id"], Entity> = new Map();

    viewer: Viewer = {} as Viewer;

    constructor() {
        super();
    }

    addElement(element: Element, local: boolean = true) {
        this.dispatchEvent(
            new CustomEvent("elementAdded", {
                detail: {
                    element: element,
                    local: local
                }
            })
        );
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
            // * 默认开启callbackProperty
            this.startEdit(element.id, element.type);
        }
    }

    startEdit(id: string, type: string) {
        let entity = this.entitiesMap.get(id);
        switch (type) {
            case "point":
                // @ts-ignore
                entity.position = new CallbackProperty(() => {
                    return cartesian3FromPoint3(
                        // @ts-ignore
                        this.elementsMap.get(id).positions[0]
                    );
                }, false);
                break;
            case "polyline":
                //@ts-ignore
                entity.polyline.positions = new CallbackProperty(() => {
                    //@ts-ignore
                    return this.elementsMap.get(id).positions.map((p) => {
                        return cartesian3FromPoint3(p);
                    });
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
                // @ts-ignore
                entity.position = cartesian3FromPoint3(
                    // @ts-ignore
                    this.elementsMap.get(id).positions[0]
                );
                break;
            case "polyline":
                // 若要阻止闪烁，可能需要再渲染一个entity
                //@ts-ignore
                entity.polyline.positions = this.elementsMap
                    .get(id)
                    // @ts-ignore
                    .positions.map((p) => {
                        return cartesian3FromPoint3(p);
                    });
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

    mutateElement(element: Element, update: {}, local: boolean = true) {
        // * update里的值 一定是被改变的。
        // console.log("mutateElement func!");
        const mutatedElement = this.elementsMap.get(element.id);
        if (!mutatedElement) {
            console.log("element not found");
            return;
        }
        // dispatch mutate info event
        this.dispatchEvent(
            new CustomEvent("elementMutated", {
                detail: {
                    id: element.id,
                    update: update,
                    local: local
                }
            })
        );
        const mutatedEntity = this.entitiesMap.get(element.id);
        // mutate element and entity
        if (element.type === "point") {
            for (const key in update) {
                const value = (update as any)[key];
                console.log("Key: ", key, " Value: ", value);
                if (typeof value !== "undefined") {
                    // TODO 下面这个element其实就是selectedElement。
                    // TODO 如果参数相同可以不修改
                    //@ts-ignore
                    mutatedElement[key] = value;
                    // 特殊的key要特殊处理
                    if (key === "description") {
                        // @ts-ignore
                        mutatedEntity[key] = value;
                    } else if (key === "color") {
                        // @ts-ignore
                        mutatedEntity.point[key] =
                            Color.fromCssColorString(value);
                    } else if (key === "positions") {
                        // positions属性不要赋值给mutatedEntity,因为由于callbackproperty
                        // 只需要修改mutatedElement就可以。
                        continue;
                    } else {
                        // @ts-ignore
                        mutatedEntity.point[key] = value;
                    }
                }
            }
        } else if (element.type === "polyline") {
            for (const key in update) {
                const value = (update as any)[key];
                console.log("Key: ", key, " Value: ", value);
                if (typeof value !== "undefined") {
                    // @ts-ignore
                    mutatedElement[key] = value;
                }
            }
        }
    }

    getSelectedElement(position: Cartesian2): Element | undefined {
        const pickedEntity = this.viewer.scene.pick(position);
        console.log("picked Entity is: ", pickedEntity);

        if (pickedEntity) {
            console.log(this.elementsMap.get(pickedEntity.id.id));

            return this.elementsMap.get(pickedEntity.id.id);
        }
        return undefined;
    }
}
