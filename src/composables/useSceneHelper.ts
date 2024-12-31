import { Cartesian3, Math as CesiumMath } from "cesium";
import { User } from "./useAwareness";
import { useGeoOasisStore } from "../store/GeoOasis.store";

export const useSceneHelper = () => {
    const store = useGeoOasisStore();
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
        store.editor.viewer?.camera.flyTo({
            destination: Cartesian3.fromElements(user.x, user.y, user.z),
            orientation: {
                heading: user.heading,
                pitch: user.pitch,
                roll: user.roll
            }
        });
    };

    return { flyToHome, synOtherUserCamera };
};
