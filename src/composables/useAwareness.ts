import { ref, Ref, watch } from "vue";
import { nanoid } from "nanoid";
import { Cartesian3 } from "cesium";
import { Editor } from "../editor/editor";

export type UserInfo = {
    id: string;
    name: string;
    color: string;
};

export type UserPos = {
    x: number;
    y: number;
    z: number;
    heading: number;
    pitch: number;
    roll: number;
};

export type User = UserInfo & UserPos;

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

export const useAwareness = (editor: Editor, roomId: Ref<string>) => {
    let cameraPosWCOld: Cartesian3;

    const userList = ref<User[]>([]);

    const handler = (
        _changes: unknown
        // event: "local" | Record<string, unknown>
    ) => {
        if (editor.provider?.awareness) {
            userList.value = Array.from(
                editor.provider?.awareness?.getStates().values()
            ).map((state) => {
                return {
                    ...state.user,
                    ...state.pos
                };
            });
        }
    };

    const setUser = (user: UserInfo) => {
        editor.provider?.awareness?.setLocalStateField("user", {
            ...user
        });
    };

    const setUserPostion = (pos: UserPos) => {
        editor.provider?.awareness?.setLocalStateField("pos", {
            ...pos
        });
    };

    const initLocalUser = () => {
        const viewer = editor.viewer;
        const camera = viewer?.camera;
        if (camera) {
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

            viewer.clock.onTick.addEventListener(() => {
                // 位置不变的时候不发送事件
                let cameraPosWC = viewer.camera.positionWC;
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
        }
    };

    watch(roomId, () => {
        if (roomId) {
            const awareness = editor.provider?.awareness;
            if (awareness) {
                awareness.on("change", handler);
                initLocalUser();
            }
        }
    });

    return {
        userList,
        setUser,
        setUserPostion
    };
};
