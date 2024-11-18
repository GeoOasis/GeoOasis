import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { Cartesian3 } from "cesium";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { User, UserInfo } from "./useAwareness";

const randomNames: string[] = ["alan", "bob", "charlie", "david"];

const getRandomName = (array: string[]): string => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex] + Math.floor(Math.random() * 100);
};

// TODO: modify
const createDefaultUser = (): UserInfo => {
    return {
        id: nanoid(),
        name: getRandomName(randomNames),
        color: "blue"
    };
};

export const useCollabBar = () => {
    let cameraPosWCOld: Cartesian3;

    // store
    const store = useGeoOasisStore();
    const { viewerRef, userList } = storeToRefs(store);
    const { setUser, setUserPostion } = store;

    onMounted(() => {
        let camera = viewerRef.value.camera;
        let cameraPosWC = camera.positionWC;
        cameraPosWCOld = cameraPosWC.clone();

        setUser(createDefaultUser());
        // camera's orientation is defined by headingPitchRoll or DirectionUp
        setUserPostion({
            x: cameraPosWC.x,
            y: cameraPosWC.y,
            z: cameraPosWC.z,
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll
        });

        // 节流
        viewerRef.value.clock.onTick.addEventListener(() => {
            // 位置不变的时候不发送事件
            let cameraPosWC = viewerRef.value.camera.positionWC;
            if (cameraPosWCOld.equals(cameraPosWC)) return;
            cameraPosWCOld = cameraPosWC.clone();
            setUserPostion({
                x: cameraPosWC.x,
                y: cameraPosWC.y,
                z: cameraPosWC.z,
                heading: camera.heading,
                pitch: camera.pitch,
                roll: camera.roll
            });
        });
    });

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
