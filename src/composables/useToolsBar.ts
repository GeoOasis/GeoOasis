import { onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useViewerStore } from "../store/viewer-store";
import {
    CallbackProperty,
    Cartesian3,
    Color,
    Entity,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType
} from "cesium";
// import "./global";

export const useToolsBar = () => {
    // data or model
    const lineEntity = new Entity({
        polyline: {
            width: 5,
            material: Color.RED,
            clampToGround: true
        }
    });
    let handler = reactive<ScreenSpaceEventHandler>(
        {} as ScreenSpaceEventHandler
    );

    // store
    const viewerStore = useViewerStore();
    const { viewerRef } = storeToRefs(viewerStore);

    // hooks
    onMounted(() => {
        console.log("ToolsBar mounted");
        const scene = viewerRef.value.scene;
        handler = new ScreenSpaceEventHandler(scene.canvas);
    });

    const addLine = () => {
        const redLine = viewerRef.value.entities.add({
            name: "Red Line",
            polyline: {
                positions: Cartesian3.fromDegreesArray([-75, 35, -100, 35]),
                width: 5,
                material: Color.RED,
                clampToGround: true
            }
        });
        viewerRef.value.flyTo(redLine);
        setTimeout(() => {
            if (redLine.polyline !== undefined) {
                (redLine.polyline.positions as any) =
                    Cartesian3.fromDegreesArray([-75, 0, -100, 0]);
            }
        }, 5000);
    };

    const addPoint = () => {
        const scene = viewerRef.value.scene;
        const point = viewerRef.value.entities.add({
            position: Cartesian3.fromDegrees(-75.59777, 40.03883),
            point: {
                pixelSize: 10,
                color: Color.YELLOW
            }
        });
        handler.setInputAction(function (
            movement: ScreenSpaceEventHandler.PositionedEvent
        ) {
            let cartesian = viewerRef.value.camera.pickEllipsoid(
                movement.position,
                scene.globe.ellipsoid
            );
            if (cartesian) {
                (point.position as any) = cartesian;
            }
        }, ScreenSpaceEventType.LEFT_CLICK);
        // handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    };

    const darwLine = () => {
        const scene = viewerRef.value.scene;
        let linePos: Cartesian3[] = [];
        const mouseMoveCallback = function (
            motionEvent: ScreenSpaceEventHandler.MotionEvent
        ) {
            let cartesian = viewerRef.value.camera.pickEllipsoid(
                motionEvent.endPosition,
                scene.globe.ellipsoid
            );
            if (cartesian) {
                console.log("mouse move successs");
                linePos[1] = cartesian;
                console.log(linePos[0], linePos[1]);
                if (lineEntity.polyline !== undefined) {
                    (lineEntity.polyline.positions as any) = linePos;
                }
            }
        };

        handler.setInputAction(function (
            positionedEvent: ScreenSpaceEventHandler.PositionedEvent
        ) {
            let cartesian = viewerRef.value.camera.pickEllipsoid(
                positionedEvent.position,
                scene.globe.ellipsoid
            );
            if (cartesian) {
                console.log("left click successs");
                linePos[0] = cartesian;
                linePos[1] = cartesian;
                if (lineEntity.polyline !== undefined) {
                    (lineEntity.polyline.positions as any) = linePos;
                }
                viewerRef.value.entities.add(lineEntity);
                // 添加鼠标移动action
                handler.setInputAction(
                    mouseMoveCallback,
                    ScreenSpaceEventType.MOUSE_MOVE
                );
            }
        }, ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction(function (
            positionedEvent: ScreenSpaceEventHandler.PositionedEvent
        ) {
            let cartesian = viewerRef.value.camera.pickEllipsoid(
                positionedEvent.position,
                scene.globe.ellipsoid
            );
            if (cartesian) {
                console.log("right click successs");
                // 移除鼠标移动action
                handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                linePos[1] = cartesian;
                if (lineEntity.polyline !== undefined) {
                    (lineEntity.polyline.positions as any) = linePos;
                }
                handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
            }
        }, ScreenSpaceEventType.RIGHT_CLICK);
        // handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    };

    const darwLineCallBackProperty = () => {
        const scene = viewerRef.value.scene;
        let linePos: Cartesian3[] = [];
        const mouseMoveCallback = function (
            motionEvent: ScreenSpaceEventHandler.MotionEvent
        ) {
            let cartesian = viewerRef.value.camera.pickEllipsoid(
                motionEvent.endPosition,
                scene.globe.ellipsoid
            );
            if (cartesian) {
                console.log("mouse move successs");
                linePos[1] = cartesian;
                console.log(linePos[0], linePos[1]);
                // if (lineEntity.polyline !== undefined) {
                //     (lineEntity.polyline.positions as any) = linePos;
                // }
            }
        };
        const rightClickCallback = function (
            positionedEvent: ScreenSpaceEventHandler.PositionedEvent
        ) {
            let cartesian = viewerRef.value.camera.pickEllipsoid(
                positionedEvent.position,
                scene.globe.ellipsoid
            );
            if (cartesian) {
                console.log("right click successs");
                // 移除鼠标移动action
                handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                linePos[1] = cartesian;
                if (lineEntity.polyline !== undefined) {
                    (lineEntity.polyline.positions as any) = linePos;
                }
                handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
                handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
            }
        };

        handler.setInputAction(function (
            positionedEvent: ScreenSpaceEventHandler.PositionedEvent
        ) {
            let cartesian = viewerRef.value.camera.pickEllipsoid(
                positionedEvent.position,
                scene.globe.ellipsoid
            );
            if (cartesian) {
                console.log("left click successs");
                linePos[0] = cartesian;
                linePos[1] = cartesian;
                if (lineEntity.polyline !== undefined) {
                    lineEntity.polyline.positions = new CallbackProperty(() => {
                        return linePos;
                    }, false);
                }
                viewerRef.value.entities.add(lineEntity);
                // 添加鼠标移动action
                handler.setInputAction(
                    mouseMoveCallback,
                    ScreenSpaceEventType.MOUSE_MOVE
                );
                handler.setInputAction(
                    rightClickCallback,
                    ScreenSpaceEventType.RIGHT_CLICK
                );
            }
        }, ScreenSpaceEventType.LEFT_CLICK);
    };

    return { addLine, addPoint, darwLine, darwLineCallBackProperty };
};
