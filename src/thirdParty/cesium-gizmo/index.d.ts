import { Viewer, Color, Matrix4 } from "cesium";
import { GizmoMode } from "../../composables/useToolsBar";

declare interface GizmoOptions {
    /**
     * 要应用gizmo的对象。
     */
    item?: {
        modelMatrix: Matrix4;
    };

    /**
     * 是否在拖动时应用变换到项目上。
     */
    applyTransformation?: boolean;

    /**
     * gizmo的模式，translate、rotate或scale。
     */
    mode?: GizmoMode;

    /**
     * 禁用Gizmo
     */
    disabled?: boolean;

    /**
     * 轴线的长度（像素）。
     * @default 300.0
     */
    length?: number;

    /**
     * 轴线的宽度（像素）。
     * @default 10
     */
    width?: number;

    /**
     * gizmo的可见性。
     * @default true
     */
    show?: boolean;

    /**
     * X轴的颜色。
     * @default Color.RED
     */
    xColor?: Color;

    /**
     * Y轴的颜色。
     * @default Color.GREEN
     */
    yColor?: Color;

    /**
     * Z轴的颜色。
     * @default Color.BLUE
     */
    zColor?: Color;

    /**
     * 高亮显示的轴线颜色。
     * @default Color.YELLOW
     */
    highlightColor?: Color;

    /**
     * 拖动移动时的回调函数。
     */
    onDragMoving?: (result: {
        mode: GizmoMode;
        result: Cartesian3 | number[];
    }) => void;

    /**
     * 开始拖动时的回调函数。
     */
    onDragStart?: () => void;

    /**
     * 结束拖动时的回调函数。
     */
    onDragEnd?: () => void;
}

declare class CesiumGizmo {
    constructor(viewer: Viewer, options?: GizmoOptions);
    destroy(): void;
    show: boolean;
    mode: GizmoMode;
    disabled: boolean;
}

declare class GizmoPrimitive {
    constructor(viewer: any, options: any);
    destroy(): void;
}

declare function getScaleForMinimumSize(model: any, frameState: any): number;

export { CesiumGizmo, GizmoPrimitive, getScaleForMinimumSize };
