import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElNotification } from "element-plus";
import {
    Viewer,
    Ion,
    Cartesian3,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    Cartographic,
    Math as CesiumMath
} from "cesium";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { useSceneHelper } from "../composables/useSceneHelper";
import { BufferTool } from "../tool/buffer";
import { HeatMapTool } from "../tool/heatmap";
import { CesiumGizmo } from "../thirdParty/cesium-gizmo";
import { Element } from "../element/element";
import {
    newPointElement,
    newPolylineElement,
    newModelElement,
    newPolygonElement,
    newRectangleElement
} from "../element/newElement";
import { point3FromCartesian3 } from "../element/utils";
import { CesiumIonDefaultToken } from "../contants";
import { DrawMode, GizmoMode } from "../editor/type";
import { defaultBaseLayers } from "../editor/imageryLayerManager";

export const useSetup = () => {
    const store = useGeoOasisStore();
    const {
        activeTool,
        drawMode,
        gizmoMode,
        selectedModelIdx,
        selectedElement,
        selectedLayer,
        selectedBaseLayer
    } = storeToRefs(store);
    const { editor } = store;
    const { flyToHome } = useSceneHelper();
    const viewerDivRef = ref<HTMLDivElement>();

    onMounted(() => {
        setupViewer();
        setupBaseLayers();
        addPointerListener();
        ElNotification({
            title: "Tips:",
            message: "Map container mounted",
            position: "bottom-right",
            duration: 3000
        });
    });

    const setupViewer = () => {
        Ion.defaultAccessToken = CesiumIonDefaultToken;
        const cesiumViewer = new Viewer(viewerDivRef.value as HTMLElement, {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: true,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: true,
            shouldAnimate: false,
            baseLayer: false
        });
        cesiumViewer.scene.globe.depthTestAgainstTerrain = true;
        window.cesiumViewer = cesiumViewer;
        store.editor.attachViewer(cesiumViewer);
        viewer = cesiumViewer;
        store.toolBox.registerTool(new BufferTool());
        store.toolBox.registerTool(new HeatMapTool());
        flyToHome();
    };

    const setupBaseLayers = () => {
        editor.viewer?.imageryLayers.layerAdded.addEventListener((e) => {
            console.log("viewer's imageryLayer added!!!", e);
        });
        editor.viewer?.imageryLayers.layerRemoved.addEventListener((e) => {
            console.log("viewer's imageryLayer removed!!!", e);
        });
        for (const layer of defaultBaseLayers) {
            editor.imageryLayerManager
                .addBaseLayerOption(layer, true)
                .then(() => {
                    if (layer.name === selectedBaseLayer.value) {
                        editor.setBaseLayer(selectedBaseLayer.value);
                    }
                });
        }
    };

    let handler: ScreenSpaceEventHandler;
    let gizmo: CesiumGizmo;
    let editingElement: Element | null = null;
    let draggingElement: Element | undefined = undefined;
    let startPoint: Cartesian3;
    let endPoint: Cartesian3;
    let viewer: Viewer;

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

    const addPointerListener = () => {
        handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
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
        gizmo = new CesiumGizmo(viewer, {
            show: drawMode.value === DrawMode.SPACE,
            applyTransformation: false,
            disabled: true,
            onDragMoving: (e) => {
                const { mode, result } = e;
                handleGizmoDragMoving(mode, result);
            }
        });
        gizmo.mode = GizmoMode.TRANSLATE;
    };

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
        let ellipsoidPos = viewer.scene.camera.pickEllipsoid(
            positionedEvent.position
        );
        let globePos = viewer.scene.pickPosition(positionedEvent.position);
        let cartoPos = Cartographic.fromCartesian(globePos);
        console.log(
            "scene.pickPos: ",
            globePos,
            "lng:",
            CesiumMath.toDegrees(cartoPos.longitude),
            "lat:",
            CesiumMath.toDegrees(cartoPos.latitude)
        );
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
                    viewer.scene.screenSpaceCameraController.enableRotate =
                        false;
                    viewer.scene.screenSpaceCameraController.enableTranslate =
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
                const PointElement = newPointElement({
                    position: startPoint
                });
                editor.addElement(PointElement);
                editingElement = PointElement;
                break;
            case "polyline":
                if (editingElement === null) {
                    const PolylineElement = newPolylineElement({
                        positions: [startPoint]
                    });
                    editor.addElement(PolylineElement);
                    editingElement = PolylineElement;
                }
                break;
            case "rectangle":
                if (editingElement === null) {
                    const rectangleEle = newRectangleElement({
                        positions: [startPoint]
                    });
                    editor.addElement(rectangleEle);
                    editingElement = rectangleEle;
                }
                break;
            case "model":
                if (!selectedModelIdx.value) {
                    console.log("choose a model");
                    editingElement = null;
                    break;
                }
                const assetId = editor.assetLibrary.getAssetId(
                    selectedModelIdx.value
                );
                if (!assetId) {
                    console.error("No this assetId");
                    editingElement = null;
                    break;
                }
                const ModelElement = newModelElement({
                    position: startPoint,
                    assetId
                });
                editor.addElement(ModelElement);
                editingElement = ModelElement;
                break;
            case "polygon":
                if (editingElement === null) {
                    const polygonElement = newPolygonElement({
                        positions: [startPoint]
                    });
                    editor.addElement(polygonElement);
                    editingElement = polygonElement;
                }
                break;
            default:
                break;
        }

        if (editingElement !== null) {
            switch (activeTool.value) {
                case "point":
                    break;
                case "polyline":
                    editor.mutateElement(editingElement.id, {
                        positions: editor
                            .getElement(editingElement.id)
                            ?.positions.concat(point3FromCartesian3(startPoint))
                    });
                    break;
                case "rectangle":
                    editor.mutateElement(editingElement.id, {
                        positions: editor
                            .getElement(editingElement.id)
                            ?.positions.concat(point3FromCartesian3(startPoint))
                    });
                    break;
                case "model":
                    break;
                case "polygon":
                    editor.mutateElement(editingElement.id, {
                        positions: editor
                            .getElement(editingElement.id)
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
        const startGlobePos = viewer.scene.pickPosition(
            motionEvent.startPosition
        );
        const endGlobePos = viewer.scene.pickPosition(
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
        if (editingElement !== null) {
            let update;
            switch (activeTool.value) {
                case "point":
                    // 目前默认绘制point不会触发mousemove事件
                    break;
                case "polyline":
                    // TODO 优化手段：减少对象创建
                    update = [
                        // @ts-ignore
                        ...editor.getElement(editingElement.id).positions
                    ];
                    update[update.length - 1] = point3FromCartesian3(endPoint);
                    editor.mutateElement(editingElement.id, {
                        positions: update
                    });
                    break;
                case "rectangle":
                    update = [
                        // @ts-ignore
                        ...editor.getElement(editingElement.id).positions
                    ];
                    update[update.length - 1] = point3FromCartesian3(endPoint);
                    editor.mutateElement(editingElement.id, {
                        positions: update
                    });
                    break;
                case "model":
                    break;
                case "polygon":
                    update = [
                        // @ts-ignore
                        ...editor.getElement(editingElement.id).positions
                    ];
                    update[update.length - 1] = point3FromCartesian3(endPoint);
                    editor.mutateElement(editingElement.id, {
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
            viewer.scene.screenSpaceCameraController.enableRotate = true;
            viewer.scene.screenSpaceCameraController.enableTranslate = true;
        }

        if (editingElement !== null) {
            switch (activeTool.value) {
                case "point":
                    editingElement = null;
                    activeTool.value = "default";
                    break;
                case "polyline":
                    break;
                case "rectangle":
                    break;
                case "model":
                    editingElement = null;
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
        if (editingElement !== null) {
            if (
                activeTool.value === "polyline" ||
                activeTool.value === "polygon" ||
                activeTool.value === "rectangle"
            ) {
                // stopEdit();
                editingElement = null;
                activeTool.value = "default";
            }
            console.log(`${activeTool.value} finish`);
        }
    };

    return {
        viewerDivRef
    };
};
