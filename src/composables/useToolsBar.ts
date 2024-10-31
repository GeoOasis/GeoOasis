import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import {
    Cartesian3,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType
} from "cesium";
import { Element } from "../element/element";
import {
    newPointElement,
    newPolylineElement,
    newModelElement,
    newPolygonElement
} from "../element/newElement";
import { point3FromCartesian3 } from "../element/utils";
import { nanoid } from "nanoid";

export const useToolsBar = () => {
    // data or model or state
    let handler: ScreenSpaceEventHandler;
    // let isEditting: boolean = true;
    let edittingElement: Element | null = null;
    let draggingElement: Element | undefined = undefined;
    let startPoint: Cartesian3;
    let endPoint: Cartesian3;

    const activeTool = ref("default");
    // const isEditting = computed(() => activeTool.value !== "default");

    // store
    const store = useGeoOasisStore();
    const { viewerRef, isPanelVisible, selectedElement, selectedLayer } =
        storeToRefs(store);
    const { editor } = store;

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
        if (!cartesian) {
            // TODO 当LeftDown的时候，未选中地球时，LeftUp和MouseMove应该怎样处理
            draggingElement = undefined;
            selectedElement.value = undefined;
            selectedLayer.value = undefined;
            isPanelVisible.value = false;
            return;
        }

        startPoint = cartesian;
        console.log("left click on earth: ", cartesian);

        // * if the active tool is default, then can drag&edit the selected element
        if (activeTool.value === "default") {
            draggingElement = editor.pickElement(positionedEvent.position);
            selectedElement.value = draggingElement;
            selectedLayer.value = editor.pickLayer(positionedEvent.position);
            isPanelVisible.value =
                selectedElement.value || selectedLayer.value ? true : false;
            if (draggingElement) {
                // 锁定相机
                viewerRef.value.scene.screenSpaceCameraController.enableRotate =
                    false;
            }
            return;
        }

        // 三种情况 point和polygon绘制的时候禁用mousemove，或者设置特定的mousemove
        // point: down up
        // line: down move up
        // polygon: down move up down move up ... doubleclick
        // TODO: id设置
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
                    // startEdit()
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
            case "polygon":
                if (edittingElement === null) {
                    const polygonElement = newPolygonElement(
                        "test",
                        "mypolygon",
                        true,
                        [startPoint]
                    );
                    editor.addElement(polygonElement);
                    edittingElement = polygonElement;
                }
                break;
            default:
                break;
        }

        if (edittingElement !== null) {
            switch (activeTool.value) {
                case "point":
                    break;
                case "polyline":
                    editor.mutateElement(edittingElement.id, {
                        positions: editor
                            .getElement(edittingElement.id)
                            ?.positions.concat(point3FromCartesian3(startPoint))
                    });
                    break;
                case "model":
                    break;
                case "polygon":
                    editor.mutateElement(edittingElement.id, {
                        positions: editor
                            .getElement(edittingElement.id)
                            ?.positions.concat(point3FromCartesian3(startPoint))
                    });
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
                    editor.mutateElement(draggingElement.id, {
                        positions: [
                            {
                                x: motionEndPosition.x,
                                y: motionEndPosition.y,
                                z: motionEndPosition.z
                            }
                        ]
                    });
                    break;
                case "polyline":
                    const updatedPos = draggingElement.positions.map((pos) => {
                        return {
                            x: pos.x + delta_x,
                            y: pos.y + delta_y,
                            z: pos.z + delta_z
                        };
                    });
                    editor.mutateElement(draggingElement.id, {
                        positions: updatedPos
                    });
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
            let update;
            switch (activeTool.value) {
                case "point":
                    // 目前默认绘制point不会触发mousemove事件
                    break;
                case "polyline":
                    // TODO 优化手段：减少对象创建
                    update = [
                        // @ts-ignore
                        ...editor.getElement(edittingElement.id)?.positions
                    ];
                    update[update.length - 1] = point3FromCartesian3(endPoint);
                    editor.mutateElement(edittingElement.id, {
                        positions: update
                    });
                    break;
                case "model":
                    break;
                case "polygon":
                    update = [
                        // @ts-ignore
                        ...editor.getElement(edittingElement.id)?.positions
                    ];
                    update[update.length - 1] = point3FromCartesian3(endPoint);
                    editor.mutateElement(edittingElement.id, {
                        positions: update
                    });
                    break;
                default:
                    break;
            }
        }
    };

    const handleCanvasLeftUp = () => {
        console.log("left up!");
        if (draggingElement !== undefined) {
            draggingElement = undefined;
            viewerRef.value.scene.screenSpaceCameraController.enableRotate =
                true;
        }

        if (edittingElement !== null) {
            switch (activeTool.value) {
                case "point":
                    edittingElement = null;
                    activeTool.value = "default";
                    break;
                case "polyline":
                    break;
                case "model":
                    edittingElement = null;
                    activeTool.value = "default";
                    break;
                case "polygon":
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
                console.log("right click, polyline finish");
                // stopEdit();
                edittingElement = null;
                activeTool.value = "default";
            } else if (activeTool.value === "polygon") {
                console.log("right click, polygon finish");
                edittingElement = null;
                activeTool.value = "default";
            }
        }
    };

    let fileContent;
    const handleLoadFile = (file: File) => {
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
            try {
                const jsonObj = JSON.parse(e.target!.result as string);
                fileContent = jsonObj;
                editor.addLayer({
                    id: nanoid(),
                    name: "Geojsontest",
                    type: "service",
                    provider: "geojson",
                    url: fileContent,
                    show: true
                });
            } catch (e) {
                console.error("file format isn't vivid JSON format", e);
            }
        });
        reader.readAsText(file); // 读取文件内容为文本
    };

    return { activeTool, handleLoadFile };
};
