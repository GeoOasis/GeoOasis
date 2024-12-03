import { Cartesian3, Math as CesiumMath } from "cesium";
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

    return { flyToHome };
};
