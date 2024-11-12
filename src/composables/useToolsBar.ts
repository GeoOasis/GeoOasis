import { onMounted, ref, watchEffect } from "vue";
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
    newPolygonElement,
    newImageElement
} from "../element/newElement";
import { point3FromCartesian3 } from "../element/utils";
import { nanoid } from "nanoid";
import { FileType, getFileType } from "../utils";
import { CesiumGizmo } from "../thirdParty/cesium-gizmo";

export enum DrawMode {
    SURFACE = "surface",
    SPACE = "space"
}

enum GizmoMode {
    TRANSLATE = "TRANSLATE",
    ROTATE = "ROTATE",
    SCALE = "SCALE",
    UNIFORM_SCALE = "UNIFORM_SCALE"
}

export const useToolsBar = () => {
    let handler: ScreenSpaceEventHandler;
    let gizmo: CesiumGizmo;
    let edittingElement: Element | null = null;
    let draggingElement: Element | undefined = undefined;
    let startPoint: Cartesian3;
    let endPoint: Cartesian3;

    const drawMode = ref(DrawMode.SURFACE);
    const activeTool = ref("default");

    const store = useGeoOasisStore();
    const { viewerRef, isPanelVisible, selectedElement, selectedLayer } =
        storeToRefs(store);
    const { editor } = store;

    watchEffect(() => {
        activeTool.value =
            drawMode.value === DrawMode.SPACE ? "default" : activeTool.value;
        if (gizmo) gizmo.show = drawMode.value === DrawMode.SPACE;
    });

    onMounted(() => {
        console.log("ToolsBar mounted");
        handler = new ScreenSpaceEventHandler(viewerRef.value.scene.canvas);
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

        gizmo = new CesiumGizmo(viewerRef.value, {
            show: drawMode.value === DrawMode.SPACE,
            applyTransformation: false,
            onDragMoving: (res: { mode: GizmoMode; result: any }) => {
                handleGizmoDragMoving(res.mode, res.result);
            }
        });

        gizmo.mode = GizmoMode.TRANSLATE;
    });

    // translate -> Cartesian3, 替换
    // rotate -> Transforms.fixedFrameToHeadingPitchRoll(finalTransform), final transform替换
    // scale uniform_scale -> [scaleX, scaleY, scaleZ]， transform替换
    const handleGizmoDragMoving = (mode: GizmoMode, result: any) => {
        console.log(mode, result);
        if (draggingElement) {
            switch (mode) {
                case GizmoMode.TRANSLATE:
                    editor.mutateElement(draggingElement.id, {
                        positions: [
                            {
                                x: result.x,
                                y: result.y,
                                z: result.z
                            }
                        ]
                    });
                    break;
                case GizmoMode.ROTATE:
                    editor.mutateElement(draggingElement.id, {
                        orientation: {
                            heading: result.heading,
                            pitch: result.pitch,
                            roll: result.roll
                        }
                    });
                    break;
                case GizmoMode.SCALE:
                    break;
                case GizmoMode.UNIFORM_SCALE:
                    break;
            }
        }
    };

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

        // * if the active tool is default, then can drag the selected element
        // * when drawMode is SPACE, the active tool is default
        if (activeTool.value === "default") {
            const pickedElement = editor.pickElement(positionedEvent.position);
            if (drawMode.value === DrawMode.SURFACE) {
                // 如果是surface模式, 照旧
                draggingElement = pickedElement;
                selectedElement.value = pickedElement;
                if (draggingElement) {
                    // 锁定相机
                    viewerRef.value.scene.screenSpaceCameraController.enableRotate =
                        false;
                    viewerRef.value.scene.screenSpaceCameraController.enableTranslate =
                        false;
                }
            } else {
                // 如果是space模式，返回结果undefined意味着 【没选中任何primitive】 OR 【选中了Gizmo】
                if (pickedElement) {
                    draggingElement = pickedElement;
                    selectedElement.value = pickedElement;
                }
            }

            selectedLayer.value = editor.pickLayer(positionedEvent.position);
            isPanelVisible.value =
                selectedElement.value || selectedLayer.value ? true : false;
            console.log(
                "selectedELement",
                selectedElement.value,
                "isPanelViseible",
                isPanelVisible.value
            );
            return;
        }

        // 三种情况 point和polygon绘制的时候禁用mousemove，或者设置特定的mousemove
        switch (activeTool.value) {
            case "point":
                const PointElement = newPointElement(
                    "1232434123432314",
                    "default",
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
                    nanoid(),
                    "",
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
        if (drawMode.value === DrawMode.SPACE) return;

        // drag element logic
        if (draggingElement !== undefined) {
            // TODO: 优化drawMode
            if (draggingElement.type === "model") return;

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
        if (drawMode.value === DrawMode.SPACE) return;

        if (draggingElement !== undefined) {
            draggingElement = undefined;
            viewerRef.value.scene.screenSpaceCameraController.enableRotate =
                true;
            viewerRef.value.scene.screenSpaceCameraController.enableTranslate =
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

    const handleLoadFile = (file: File) => {
        const fileType = getFileType(file.name);
        if (!fileType) {
            throw new Error("unknown file type");
        }
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
            if (fileType === FileType.GEOJSON || fileType === FileType.JSON) {
                try {
                    const jsonObj = JSON.parse(e.target!.result as string);
                    editor.addLayer({
                        id: nanoid(),
                        name: "Geojsontest",
                        type: "service",
                        provider: "geojson",
                        url: jsonObj,
                        show: true
                    });
                } catch (e) {
                    console.error("file format isn't vivid JSON format", e);
                }
            } else if (fileType === FileType.PNGImage) {
                const imageArr = new Uint8Array(
                    e.target?.result as ArrayBuffer
                );
                const imageElement = newImageElement({
                    name: "",
                    show: "true",
                    url: imageArr
                    // url: e.target?.result
                });
                editor.addElement(imageElement);
            }
        });
        if (fileType === FileType.GEOJSON || fileType === FileType.JSON) {
            reader.readAsText(file); // 读取文件内容为文本
        } else if (fileType === FileType.PNGImage) {
            // reader.readAsDataURL(file);
            reader.readAsArrayBuffer(file);
        }
    };

    return { activeTool, drawMode, handleLoadFile };
};
