import { ref, onMounted, onUnmounted } from "vue";
import { HocuspocusProvider } from "@hocuspocus/provider";

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

export const useAwareness = (awareness: HocuspocusProvider["awareness"]) => {
    const userList = ref<User[]>([]);

    const handler = (
        _changes: unknown
        // event: "local" | Record<string, unknown>
    ) => {
        if (awareness) {
            userList.value = Array.from(awareness?.getStates().values()).map(
                (state) => {
                    return {
                        ...state.user,
                        ...state.pos
                    };
                }
            );
        }
    };

    const setUser = (user: UserInfo) => {
        awareness?.setLocalStateField("user", {
            ...user
        });
    };

    const setUserPostion = (pos: UserPos) => {
        awareness?.setLocalStateField("pos", {
            ...pos
        });
    };

    onMounted(() => awareness?.on("change", handler));
    onUnmounted(() => awareness?.off("change", handler));

    return {
        userList,
        setUser,
        setUserPostion
    };
};
