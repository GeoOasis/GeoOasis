import { ref, Ref, watch } from "vue";
import { useStorage } from "@vueuse/core";
import { nanoid } from "nanoid";
import { Editor } from "../editor/editor";
import { Point3 } from "../element/types";
import { CameraPrimitive } from "../scene/CameraPrimitive";

export type UserInfo = {
    id: string;
    name: string;
    color: string;
};

export type UserPos = {
    position: Point3;
    direction: Point3;
    up: Point3;
    right: Point3;
};

export type User = UserInfo & UserPos;

export type AwarenessUser = {
    user: UserInfo;
    pos: UserPos;
};

const randomNames: string[] = ["alan", "bob", "charlie", "david"];

const getRandomName = (array: string[]): string => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex] + Math.floor(Math.random() * 100);
};

// TODO: optimize
const createDefaultUser = (): UserInfo => {
    return {
        id: nanoid(),
        name: getRandomName(randomNames),
        color: "blue"
    };
};

export const useAwareness = (editor: Editor, roomId: Ref<string>) => {
    const userList = ref<User[]>([]);
    const localUser = useStorage("default-user", createDefaultUser());

    watch(roomId, (_newId, _oldId, onCleanup) => {
        let removeListener: Function | undefined;

        if (roomId.value) {
            const awareness = editor.provider?.awareness;
            awareness?.on("change", handler);
            awareness?.on("change", entityHandler);
            removeListener = initLocalUser();
        }

        onCleanup(() => {
            if (roomId.value) {
                const awareness = editor.provider?.awareness;
                awareness?.off("change", handler);
                awareness?.off("change", entityHandler);
                removeListener?.();
            }
        });
    });

    const handler = (
        _changes: Record<"added" | "updated" | "removed", number[]>,
        _event: "local" | Record<string, unknown>
    ) => {
        const awareness = editor.provider?.awareness;
        if (awareness) {
            // TODO: optimize
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
        if (!awareness) return;
        const userStates = awareness.getStates() as Map<number, AwarenessUser>;
        changes.added.forEach((clientId) => {
            const remoteUserState = userStates.get(clientId);
            if (remoteUserState) {
                const { position, direction, up, right } = remoteUserState.pos;
                const cameraPrimitive = new CameraPrimitive({
                    id: clientId.toString()
                });
                cameraPrimitive.setCameraInfo(position, direction, up, right);
                editor.cameraPrimitivesCollection.add(cameraPrimitive);
            }
        });
        changes.removed.forEach((clientId) => {
            editor.cameraPrimitivesCollection.removeById(clientId.toString());
        });
        changes.updated.forEach((clientId) => {
            const remoteUserState = userStates.get(clientId);
            if (remoteUserState) {
                const { position, direction, up, right } = remoteUserState.pos;
                const cameraPrimitive =
                    editor.cameraPrimitivesCollection.getById(
                        clientId.toString()
                    ) as CameraPrimitive;
                console.log("update: ", cameraPrimitive);
                cameraPrimitive.setCameraInfo(position, direction, up, right);
            }
        });
    };

    const setUser = (user: UserInfo) => {
        editor.provider?.awareness?.setLocalStateField("user", {
            ...user
        });
    };

    const setUserPosition = (pos: UserPos) => {
        editor.provider?.awareness?.setLocalStateField("pos", {
            ...pos
        });
    };

    const initLocalUser = () => {
        const viewer = editor.viewer;
        const camera = viewer?.camera;
        if (!camera) return;
        setUser(localUser.value);
        setUserPosition({
            position: {
                x: camera.positionWC.x,
                y: camera.positionWC.y,
                z: camera.positionWC.z
            },
            direction: {
                x: camera.directionWC.x,
                y: camera.directionWC.y,
                z: camera.directionWC.z
            },
            up: {
                x: camera.upWC.x,
                y: camera.upWC.y,
                z: camera.upWC.z
            },
            right: {
                x: camera.rightWC.x,
                y: camera.rightWC.y,
                z: camera.rightWC.z
            }
        });
        let removeListener = viewer.clock.onTick.addEventListener(() => {
            // TODO: throttle
            setUserPosition({
                position: {
                    x: camera.positionWC.x,
                    y: camera.positionWC.y,
                    z: camera.positionWC.z
                },
                direction: {
                    x: camera.directionWC.x,
                    y: camera.directionWC.y,
                    z: camera.directionWC.z
                },
                up: {
                    x: camera.upWC.x,
                    y: camera.upWC.y,
                    z: camera.upWC.z
                },
                right: {
                    x: camera.rightWC.x,
                    y: camera.rightWC.y,
                    z: camera.rightWC.z
                }
            });
        });
        return removeListener;
    };

    return {
        userList,
        setUser,
        setUserPosition
    };
};
