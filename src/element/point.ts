import { Cartesian3 } from "cesium";

export type Point3 = {
    x: number;
    y: number;
    z: number;
};

export function cartesian3FromPoint3(point: Point3) {
    return new Cartesian3(point.x, point.y, point.z);
}
