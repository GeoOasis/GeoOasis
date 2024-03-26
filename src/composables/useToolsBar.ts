import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useViewerStore } from "../store/viewer-store";
import {
    Cartesian3,
    Color,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    Entity
} from "cesium";
import {
    newPointElement,
    Element,
    newPolylineElement,
    newModelElement
} from "../element/element";
import { da } from "element-plus/es/locales.mjs";

export const useToolsBar = () => {
    // data or model or state
    let handler: ScreenSpaceEventHandler;
    let isEditting: boolean = true;
    let edittingElement: Element | null = null;
    let draggingElement: Element | undefined = undefined;
    let startPoint: Cartesian3;
    let endPoint: Cartesian3;

    const activeTool = ref("default");
    // const isEditting = computed(() => activeTool.value !== "default");

    // store
    const viewerStore = useViewerStore();
    // 解构store中的state
    const { viewerRef, isElementPanel, selectedElement } =
        storeToRefs(viewerStore);
    // 解构store中的普通变量
    const { editor } = viewerStore;

    // hooks
    onMounted(() => {
        console.log("ToolsBar mounted");
        const scene = viewerRef.value.scene;
        handler = new ScreenSpaceEventHandler(scene.canvas);
        handler.setInputAction(
            handleCanvasLeftDown,
            ScreenSpaceEventType.LEFT_DOWN
        );
        handler.setInputAction(
            handleCanvasLeftUp,
            ScreenSpaceEventType.LEFT_UP
        );
        handler.setInputAction(
            handleCanvasMouseMove,
            ScreenSpaceEventType.MOUSE_MOVE
        );
        handler.setInputAction(
            handleCanvasRightClick,
            ScreenSpaceEventType.RIGHT_CLICK
        );
    });

    const handleCanvasLeftDown = (
        positionedEvent: ScreenSpaceEventHandler.PositionedEvent
    ) => {
        console.log("left down!");

        let cartesian = viewerRef.value.camera.pickEllipsoid(
            positionedEvent.position,
            viewerRef.value.scene.globe.ellipsoid
        );
        // TODO 当LeftDown的时候，未选中地球时，LeftUp和MouseMove应该怎样处理
        if (!cartesian) {
            draggingElement = undefined;
            selectedElement.value = undefined;
            isElementPanel.value = false;
            return;
        }

        startPoint = cartesian;
        console.log("left click on earth: ", cartesian);

        // * if the active tool is default, then can drag&edit the selected element
        if (activeTool.value === "default") {
            // TODO 这里的逻辑还可以优化，draggingElement, selectedElement变量等等
            draggingElement = editor.getSelectedElement(
                positionedEvent.position
            );
            selectedElement.value = draggingElement;
            isElementPanel.value = selectedElement.value ? true : false;
            if (draggingElement) {
                // 锁定相机
                viewerRef.value.scene.screenSpaceCameraController.enableRotate =
                    false;
                console.log("start edit element: ", draggingElement.id);
                editor.startEdit(draggingElement.id, draggingElement.type);
            }
            return;
        }

        // 三种情况 point和polygon绘制的时候禁用mousemove，或者设置特定的mousemove
        // point: down up
        // line: down move up
        // polygon: down move up down move up ... doubleclick
        switch (activeTool.value) {
            case "point":
                const PointElement = newPointElement(
                    "1232434123432314",
                    "myPoint",
                    true,
                    startPoint
                );
                editor.addElement(PointElement);
                edittingElement = PointElement;
                break;
            case "polyline":
                if (edittingElement === null) {
                    const PolylineElement = newPolylineElement(
                        "21",
                        "myPolyline",
                        true,
                        [startPoint]
                    );
                    editor.addElement(PolylineElement);
                    edittingElement = PolylineElement;
                    // ! startEdit()
                    editor.startEdit(edittingElement.id, edittingElement.type);
                }
                break;
            case "rectangle":
                break;
            case "model":
                const ModelElement = newModelElement(
                    "1232434123432314",
                    "myModel",
                    true,
                    startPoint,
                    "./Cesium_Air.glb"
                );
                editor.addElement(ModelElement);
                edittingElement = ModelElement;
                break;
            default:
                break;
        }

        if (edittingElement !== null) {
            switch (activeTool.value) {
                case "point":
                    break;
                case "polyline":
                    // TODO 这个操作实际上也是mutateElement操作，但是比较特殊。
                    // @ts-ignore
                    edittingElement.positions.push(startPoint);
                    break;
                case "model":
                    break;
                default:
                    break;
            }
        }
    };

    const handleCanvasMouseMove = (
        motionEvent: ScreenSpaceEventHandler.MotionEvent
    ) => {
        // drag element logic
        if (draggingElement !== undefined) {
            const motionStartPosition = viewerRef.value.camera.pickEllipsoid(
                motionEvent.startPosition
            );
            const motionEndPosition = viewerRef.value.camera.pickEllipsoid(
                motionEvent.endPosition
            );
            if (
                motionStartPosition === undefined ||
                motionEndPosition === undefined
            )
                return;
            const delta_x = motionEndPosition.x - motionStartPosition.x;
            const delta_y = motionEndPosition.y - motionStartPosition.y;
            const delta_z = motionEndPosition.z - motionStartPosition.z;
            switch (draggingElement.type) {
                case "point":
                    editor.mutateElement(draggingElement, {
                        position: {
                            x: motionEndPosition.x,
                            y: motionEndPosition.y,
                            z: motionEndPosition.z
                        }
                    });
                    break;
                case "polyline":
                    // editor.mutateElement(draggingElement, {
                    //     positions: []
                    // });
                    break;
                default:
                    break;
            }
        }

        // draw element logic
        if (edittingElement === null) return;
        let cartesian = viewerRef.value.camera.pickEllipsoid(
            motionEvent.endPosition,
            viewerRef.value.scene.globe.ellipsoid
        );
        if (!cartesian) return;
        endPoint = cartesian;
        if (edittingElement !== null) {
            switch (activeTool.value) {
                // TODO 目前默认point不会触发mousemove事件
                case "point":
                    break;
                case "polyline":
                    // TODO 优化手段：记录点数，直接修改？
                    // @ts-ignore
                    edittingElement.positions.pop();
                    // @ts-ignore
                    edittingElement.positions.push(endPoint);
                    break;
                case "model":
                    break;
                default:
                    break;
            }
        }
    };

    const handleCanvasLeftUp = () => {
        console.log("left up!");
        if (draggingElement !== undefined) {
            console.log("stop edit element: ", draggingElement.id);
            editor.stopEdit(draggingElement.id, draggingElement.type);
            draggingElement = undefined;
            viewerRef.value.scene.screenSpaceCameraController.enableRotate =
                true;
        }

        if (edittingElement !== null) {
            switch (activeTool.value) {
                case "point":
                    // ! stopEdit()
                    edittingElement = null;
                    activeTool.value = "default";
                    break;
                case "polyline":
                    break;
                case "model":
                    edittingElement = null;
                    activeTool.value = "default";
                    break;
                default:
                    break;
            }
        }
    };

    const handleCanvasRightClick = () => {
        console.log("right click");
        if (edittingElement !== null) {
            if (activeTool.value === "polyline") {
                console.log("double click, polyline finish");
                // stopEdit();
                editor.stopEdit(edittingElement.id, edittingElement.type);
                edittingElement = null;
                activeTool.value = "default";
            }
        }
    };

    const addImage = () => {
        // const redLine = viewerRef.value.entities.add({
        //     name: "Image Rectangle",
        //     rectangle: {
        //         coordinates: Rectangle.fromDegrees(-92.0, 30.0, -76.0, 40.0),
        //         material: Color.GREEN.withAlpha(0.5)
        //     }
        //     // polyline: {
        //     //     positions: Cartesian3.fromDegreesArray([-75, 35, -100, 35]),
        //     //     width: 5,
        //     //     material: Color.RED,
        //     //     clampToGround: true
        //     // }
        // });
        // viewerRef.value.flyTo(redLine);
        // setTimeout(() => {
        //     if (redLine.polyline !== undefined) {
        //         (redLine.polyline.positions as any) =
        //             Cartesian3.fromDegreesArray([-75, 0, -100, 0]);
        //     }
        // }, 5000);
        const ent = new Entity({
            name: "fsd",
            point: {
                pixelSize: 12
            }
        });
        const ProxyEntity = new Proxy(ent, {
            get(target, prop) {
                if (prop === "name") {
                    return target[prop];
                }
            }
        });
        viewerRef.value.entities.add(ProxyEntity);

        const model = viewerRef.value.entities.add({
            name: "123",
            position: Cartesian3.fromDegrees(-75, 40, 0),
            model: {
                uri: "./Cesium_Air.glb",
                minimumPixelSize: 128,
                maximumScale: 20000
            }
        });
        viewerRef.value.trackedEntity = model;
    };

    return { activeTool, addImage };
};
