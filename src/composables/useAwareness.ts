import { ref, Ref, watch } from "vue";
import { nanoid } from "nanoid";
import { CallbackPositionProperty, Cartesian3, Color, Entity } from "cesium";
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

type AwarenessUser = {
    user: UserInfo;
    pos: UserPos;
};

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

    watch(roomId, () => {
        if (roomId) {
            const awareness = editor.provider?.awareness;
            if (awareness) {
                awareness.on("change", handler);
                awareness.on("change", entityHandler);
                initLocalUser();
            }
        }
    });

    const handler = (
        changes: Record<"added" | "updated" | "removed", number[]>,
        event: "local" | Record<string, unknown>
    ) => {
        const awareness = editor.provider?.awareness;
        if (awareness) {
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

    const entityHandler = (
        changes: Record<"added" | "updated" | "removed", number[]>,
        event: "local" | Record<string, unknown>
    ) => {
        if (event === "local") return;
        const awareness = editor.provider?.awareness;
        if (awareness) {
            changes.added.forEach((clientId) => {
                const remoteState = awareness
                    .getStates()
                    .get(clientId) as AwarenessUser;
                const entity = new Entity({
                    id: clientId.toString(),
                    name: remoteState.user.name,
                    position: new CallbackPositionProperty((time, result) => {
                        if (!result) {
                            result = new Cartesian3();
                        }
                        const remoteState = awareness
                            .getStates()
                            .get(clientId) as AwarenessUser;
                        result.x = remoteState.pos.x;
                        result.y = remoteState.pos.y;
                        result.z = remoteState.pos.z;
                        return result;
                    }, false),
                    // TODO: optimize
                    // orientation: new CallbackProperty((time, result) => {
                    //     const remoteState = awareness
                    //         .getStates()
                    //         .get(clientId) as AwarenessUser;
                    //     const center = Cartesian3.fromElements(
                    //         remoteState.pos.x,
                    //         remoteState.pos.y,
                    //         remoteState.pos.z
                    //     );
                    //     return Transforms.headingPitchRollQuaternion(
                    //         center,
                    //         new HeadingPitchRoll(
                    //             remoteState.pos.heading,
                    //             remoteState.pos.pitch,
                    //             remoteState.pos.roll
                    //         )
                    //     );
                    // }, false),
                    point: {
                        color: Color.fromRandom(),
                        pixelSize: 50
                    }
                });
                editor.viewer?.entities.add(entity);
            });
            changes.removed.forEach((clientId) => {
                editor.viewer?.entities.removeById(clientId.toString());
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
                // TODO: throttle
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

    return {
        userList,
        setUser,
        setUserPostion
    };
};
