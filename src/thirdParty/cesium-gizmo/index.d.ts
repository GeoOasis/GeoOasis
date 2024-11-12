declare class CesiumGizmo {
    constructor(viewer: any, options: any);
    destroy(): void;
    show: boolean;
    mode: "TRANSLATE" | "ROTATE" | "SCALE" | "UNIFORM_SCALE";
}

declare class GizmoPrimitive {
    constructor(viewer: any, options: any);
    destroy(): void;
}

export { CesiumGizmo, GizmoPrimitive };
