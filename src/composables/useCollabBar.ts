import { storeToRefs } from "pinia";
import { Cartesian3 } from "cesium";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { User } from "./useAwareness";

export const useCollabBar = () => {
    // store
    const store = useGeoOasisStore();
    const { viewerRef, userList } = storeToRefs(store);
    // const { setUser, setUserPostion } = store;

    const synOtherUserCamera = (user: User) => {
        if (user.id === userList.value[0].id) return;
        viewerRef.value.camera.flyTo({
            destination: Cartesian3.fromElements(user.x, user.y, user.z),
            orientation: {
                heading: user.heading,
                pitch: user.pitch,
                roll: user.roll
            }
        });
    };

    return {
        userList,
        synOtherUserCamera
    };
};
