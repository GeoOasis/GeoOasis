import { onMounted, ref, watch } from "vue";
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
    newImageElement,
    newRectangleElement
} from "../element/newElement";
import { point3FromCartesian3 } from "../element/utils";
import { nanoid } from "nanoid";
import { FileType, getFileType } from "../utils";
import { CesiumGizmo } from "../thirdParty/cesium-gizmo";

export enum DrawMode {
    SURFACE = "surface",
    SPACE = "space"
}

export enum GizmoMode {
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

    const activeTool = ref("default");
    const drawMode = ref(DrawMode.SURFACE);
    const gizmoMode = ref(GizmoMode.TRANSLATE);
    const selectedModel = ref("");

    const store = useGeoOasisStore();
    const { viewerRef, selectedElement, selectedLayer } = storeToRefs(store);
    const { editor } = store;

    watch(drawMode, () => {
        activeTool.value =
            drawMode.value === DrawMode.SPACE ? "default" : activeTool.value;
        if (gizmo) {
            gizmo.show = drawMode.value === DrawMode.SPACE;
            gizmo.disabled = !gizmo.show;
        }
    });

    watch(gizmoMode, () => {
        if (gizmo) {
            gizmo.mode = gizmoMode.value;
        }
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
            disabled: true,
            onDragMoving: (e) => {
                const { mode, result } = e;
                handleGizmoDragMoving(mode, result);
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
                    // TODO:
                    break;
                case GizmoMode.UNIFORM_SCALE:
                    editor.mutateElement(draggingElement.id, {
                        scale: {
                            x: result[0],
                            y: result[1],
                            z: result[2]
                        }
                    });
                    break;
            }
        }
    };

    const handleCanvasLeftDown = (
        positionedEvent: ScreenSpaceEventHandler.PositionedEvent
    ) => {
        console.log("left down!");
        let ellipsoidPos = viewerRef.value.scene.camera.pickEllipsoid(
            positionedEvent.position
        );
        let globePos = viewerRef.value.scene.pickPosition(
            positionedEvent.position
        );

        console.log("scene.pickPos: ", globePos);
        console.log("camera.pickEllipsoid: ", ellipsoidPos);
        if (!globePos) {
            // TODO 当LeftDown的时候，未选中地球时，LeftUp和MouseMove应该怎样处理
            draggingElement = undefined;
            selectedElement.value = undefined;
            selectedLayer.value = undefined;
            return;
        }

        startPoint = globePos;
        // console.log("left click on earth: ", globePos);

        // * if the active tool is default, then can drag the selected element
        // * when drawMode is SPACE, the active tool is default
        if (activeTool.value === "default") {
            const pickedElement = editor.pickElement(positionedEvent.position);
            if (drawMode.value === DrawMode.SURFACE) {
                draggingElement = pickedElement;
                selectedElement.value = pickedElement;
                if (draggingElement) {
                    console.log("lock camera");
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
                }
                break;
            case "rectangle":
                if (edittingElement === null) {
                    const rectangleEle = newRectangleElement("", true, [
                        startPoint
                    ]);
                    editor.addElement(rectangleEle);
                    edittingElement = rectangleEle;
                }
                break;
            case "model":
                if (!selectedModel.value) {
                    console.log("choose a model");
                    edittingElement = null;
                    break;
                }
                const ModelElement = newModelElement(
                    nanoid(),
                    "",
                    true,
                    startPoint,
                    `./${selectedModel.value}`
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
                case "rectangle":
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
        const startGlobePos = viewerRef.value.scene.pickPosition(
            motionEvent.startPosition
        );
        const endGlobePos = viewerRef.value.scene.pickPosition(
            motionEvent.startPosition
        );
        if (!startGlobePos || !endGlobePos) return;
        endPoint = endGlobePos;
        // drag element logic
        if (draggingElement !== undefined) {
            // TODO: 优化drawMode
            if (draggingElement.type === "model") return;
            // const motionStartPosition = viewerRef.value.camera.pickEllipsoid(
            //     motionEvent.startPosition
            // );
            // const motionEndPosition = viewerRef.value.camera.pickEllipsoid(
            //     motionEvent.endPosition
            // );
            const delta_x = endGlobePos.x - startGlobePos.x;
            const delta_y = endGlobePos.y - startGlobePos.y;
            const delta_z = endGlobePos.z - startGlobePos.z;
            let elTmp;
            switch (draggingElement.type) {
                case "point":
                    editor.mutateElement(draggingElement.id, {
                        positions: [
                            {
                                x: endGlobePos.x,
                                y: endGlobePos.y,
                                z: endGlobePos.z
                            }
                        ]
                    });
                    break;
                case "polyline":
                    elTmp = editor.getElement(draggingElement.id) as Element;
                    editor.mutateElement(draggingElement.id, {
                        positions: elTmp.positions.map((pos) => {
                            return {
                                x: pos.x + delta_x,
                                y: pos.y + delta_y,
                                z: pos.z + delta_z
                            };
                        })
                    });
                    break;
                case "polygon":
                    elTmp = editor.getElement(draggingElement.id) as Element;
                    editor.mutateElement(draggingElement.id, {
                        positions: elTmp.positions.map((pos) => {
                            return {
                                x: pos.x + delta_x,
                                y: pos.y + delta_y,
                                z: pos.z + delta_z
                            };
                        })
                    });
                    break;
                default:
                    break;
            }
            return;
        }

        // draw element logic
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
                        ...editor.getElement(edittingElement.id).positions
                    ];
                    update[update.length - 1] = point3FromCartesian3(endPoint);
                    editor.mutateElement(edittingElement.id, {
                        positions: update
                    });
                    break;
                case "rectangle":
                    update = [
                        // @ts-ignore
                        ...editor.getElement(edittingElement.id).positions
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
                        ...editor.getElement(edittingElement.id).positions
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
                case "rectangle":
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
            if (
                activeTool.value === "polyline" ||
                activeTool.value === "polygon" ||
                activeTool.value === "rectangle"
            ) {
                // stopEdit();
                edittingElement = null;
                activeTool.value = "default";
            }
            console.log(`${activeTool.value} finish`);
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
            } else if (fileType === FileType.GLB) {
                const base64GLB = e.target!.result as string;
                const ModelElement = newModelElement(
                    nanoid(),
                    "",
                    true,
                    Cartesian3.fromDegrees(114.0, 22.0),
                    base64GLB
                );
                editor.addElement(ModelElement);
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

        // TODO: optimize, we don't want to use Yjs to transfer data
        if (
            fileType === FileType.GEOJSON ||
            fileType === FileType.JSON ||
            fileType === FileType.GLTF
        ) {
            reader.readAsText(file); // 读取文件内容为文本
        } else if (fileType === FileType.PNGImage) {
            reader.readAsArrayBuffer(file);
        } else if (fileType === FileType.GLB) {
            reader.readAsDataURL(file);
        }
    };

    return { activeTool, drawMode, gizmoMode, selectedModel, handleLoadFile };
};
