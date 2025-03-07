import {
    Cartesian3,
    Color,
    ColorGeometryInstanceAttribute,
    destroyObject,
    FrustumGeometry,
    GeometryInstance,
    Math as CesiumMath,
    PerInstanceColorAppearance,
    PerspectiveFrustum,
    Primitive,
    Quaternion,
    Matrix4,
    Matrix3,
    FrustumOutlineGeometry,
    Cartographic
} from "cesium";
import { Point3 } from "../element/types";

const scratchRight = new Cartesian3();
const scratchRotation = new Matrix3();
const scratchOrientation = new Quaternion();
const scratchCartographic = new Cartographic();

export class CameraPrimitive {
    public show: boolean;
    private frustumPrimitive: Primitive | null;
    private frustumOutLinePrimitive: Primitive | null;
    private updateOnChange: boolean;
    private scale: number;
    public id: string;
    public modelMatrix: Matrix4;
    public length: number;
    public position: Cartesian3;
    public direction: Cartesian3;
    public up: Cartesian3;
    public right: Cartesian3;

    constructor(option: { id: string }) {
        this.show = true;
        this.frustumPrimitive = null;
        this.frustumOutLinePrimitive = null;
        this.updateOnChange = true;
        this.scale = 1;
        this.position = new Cartesian3();
        this.direction = new Cartesian3();
        this.up = new Cartesian3();
        this.right = new Cartesian3();
        this.id = option.id;
        this.modelMatrix = Matrix4.fromTranslation(this.position);
        this.length = 100; // px
    }

    setCameraInfo(pos: Point3, dir: Point3, up: Point3, right: Point3) {
        this.position.x = pos.x;
        this.position.y = pos.y;
        this.position.z = pos.z;

        this.direction.x = dir.x;
        this.direction.y = dir.y;
        this.direction.z = dir.z;

        this.up.x = up.x;
        this.up.y = up.y;
        this.up.z = up.z;

        this.right.x = right.x;
        this.right.y = right.y;
        this.right.z = right.z;
    }

    update(frameState: any) {
        if (!this.show) {
            return;
        }

        if (this.updateOnChange) {
            // Recreate the primitive every frame
            this.frustumPrimitive?.destroy();
            this.frustumPrimitive = null;

            this.frustumOutLinePrimitive?.destroy();
            this.frustumOutLinePrimitive = null;
        }

        // * scale defined by the camera position.
        const cartographicPos = Cartographic.fromCartesian(
            this.position,
            undefined,
            scratchCartographic
        );
        console.log("height", cartographicPos.height);
        if (cartographicPos.height < 1e3) {
            this.scale = cartographicPos.height / 10;
        } else if (cartographicPos.height < 1e4) {
            this.scale = 1e3;
        } else if (cartographicPos.height < 1e6) {
            this.scale = 1e4;
        } else {
            this.scale = 1e6;
        }

        // console.log("scale: ", this.scale);

        if (!this.frustumPrimitive) {
            const direction = this.direction;
            const up = this.up;
            let right = this.right;
            right = Cartesian3.negate(right, scratchRight);

            const rotation = scratchRotation;
            Matrix3.setColumn(rotation, 0, right, rotation);
            Matrix3.setColumn(rotation, 1, up, rotation);
            Matrix3.setColumn(rotation, 2, direction, rotation);

            const orientation = Quaternion.fromRotationMatrix(
                rotation,
                scratchOrientation
            );

            const far = 10.0 + this.scale;

            const frustum = new PerspectiveFrustum({
                fov: CesiumMath.toRadians(60.0),
                aspectRatio: 2,
                near: 10.0,
                far: far
            });

            this.frustumPrimitive = new Primitive({
                geometryInstances: new GeometryInstance({
                    geometry: new FrustumGeometry({
                        origin: this.position,
                        orientation: orientation,
                        frustum: frustum
                    }),
                    attributes: {
                        color: ColorGeometryInstanceAttribute.fromColor(
                            new Color(1.0, 0.0, 0.0, 0.2)
                        )
                    },
                    id: this.id,
                    // @ts-ignore
                    pickPrimitive: this
                }),
                appearance: new PerInstanceColorAppearance({
                    closed: true,
                    flat: true
                }),
                asynchronous: false
            });

            this.frustumOutLinePrimitive = new Primitive({
                geometryInstances: new GeometryInstance({
                    geometry: new FrustumOutlineGeometry({
                        origin: this.position,
                        orientation: orientation,
                        frustum: frustum
                    }),
                    attributes: {
                        color: ColorGeometryInstanceAttribute.fromColor(
                            Color.CYAN
                        )
                    },
                    id: this.id,
                    // @ts-ignore
                    pickPrimitive: this
                }),
                appearance: new PerInstanceColorAppearance({
                    translucent: false,
                    flat: true
                }),
                asynchronous: false
            });
        }

        // @ts-ignore
        this.frustumPrimitive.update(frameState);
        // @ts-ignore
        this.frustumOutLinePrimitive?.update(frameState);
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        this.frustumPrimitive?.destroy();
        this.frustumPrimitive = null;
        this.frustumOutLinePrimitive?.destroy();
        this.frustumOutLinePrimitive = null;
        return destroyObject(this);
    }
}
