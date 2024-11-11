declare class CesiumGizmo {
    constructor(viewer: any, options: any);
    destroy(): void;
    show: boolean;
}

declare class GizmoPrimitive {
    constructor(viewer: any, options: any);
    destroy(): void;
}

export { CesiumGizmo, GizmoPrimitive };
