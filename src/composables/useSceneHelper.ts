import { Cartesian3, Math as CesiumMath, Matrix3, Quaternion } from "cesium";
import { storeToRefs } from "pinia";
import { User } from "./useAwareness";
import { useGeoOasisStore } from "../store/GeoOasis.store";

export const useSceneHelper = () => {
    const store = useGeoOasisStore();

    const { cursorPosition } = storeToRefs(store);

    const flyToHome = () => {
        store.editor.viewer?.camera.flyTo({
            destination: Cartesian3.fromDegrees(105.0, 20.0, 5000000.0),
            orientation: {
                heading: CesiumMath.toRadians(0.0),
                pitch: CesiumMath.toRadians(-70),
                roll: 0.0
            }
        });
    };

    const synOtherUserCamera = (user: User) => {
        if (user.id === store.userList[0].id) return;
        const direction = user.direction as Cartesian3;
        const up = user.up as Cartesian3;
        const right = user.right as Cartesian3;
        Cartesian3.negate(right, right);
        const rotation = new Matrix3();
        Matrix3.setColumn(rotation, 0, right, rotation);
        Matrix3.setColumn(rotation, 1, up, rotation);
        Matrix3.setColumn(rotation, 2, direction, rotation);

        const orientation = Quaternion.fromRotationMatrix(rotation);

        store.editor.viewer?.camera.flyTo({
            destination: Cartesian3.fromElements(
                user.position.x,
                user.position.y,
                user.position.z
            ),
            orientation: orientation
        });
    };

    return { cursorPosition, flyToHome, synOtherUserCamera };
};
