import { onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import { CallbackProperty, Cartesian3, Color, Entity } from "cesium";
import { useViewerStore } from "../store/viewer-store";
import { User } from "../core/collab/User";
import { SERVER_URL } from "../Config";

type UserList = Map<string, User>;

const randomNames: string[] = ["alan", "bob", "charlie", "david"];

function getRandomName(array: string[]): string {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex] + Math.floor(Math.random() * 100);
}

export const useCollabBar = () => {
    // data or model
    // const usersList: UserList = new Map<string, User>();
    const usersList = reactive<UserList>(new Map());
    let userLocal: User = {} as User;
    const usersEntity = new Map<string, Entity>();

    // store
    const viewerStore = useViewerStore();
    const { viewerRef } = storeToRefs(viewerStore);

    // @ts-ignore
    const socket = io(SERVER_URL);
    socket.on("userJoined", (user: User) => {
        usersList.set(user.id, user);
        const userEntity = createUserEntity(user);
        addUserEntity(userEntity);
        usersEntity.set(user.id, userEntity);
    });
    socket.on("userMoved", (user: User) => {
        let userTemp = usersList.get(user.name);
        if (userTemp !== undefined) {
            userTemp.x = user.x;
            userTemp.y = user.y;
            userTemp.z = user.z;
        }
    });
    socket.on("userLeft", (user: User) => {
        usersList.delete(user.id);
        removeUserEntity(user.id);
    });
    socket.on("UserData", (users: any) => {
        console.log("UserData::", users);
        usersList.clear();
        users.forEach((user: any) => {
            usersList.set(user[0], user[1]);
            if (user[0] === userLocal.id) return;
            const userEntity = createUserEntity(user[1]);
            addUserEntity(userEntity);
            usersEntity.set(user[0], userEntity);
        });
    });

    // methods
    const createUserEntity = (user: User) => {
        const userEntity = new Entity({
            id: user.id,
            // name: user.name,
            // @ts-ignore
            position: new CallbackProperty((time, result) => {
                return Cartesian3.fromElements(user.x, user.y, user.z, result);
            }, false),
            // position: Cartesian3.fromElements(user.x, user.y, user.z),
            box: {
                dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
                material: Color.YELLOW
            }
        });
        return userEntity;
    };
    const addUserEntity = (entity: Entity) => {
        viewerRef.value.entities.add(entity);
    };
    const removeUserEntity = (userId: string) => {
        viewerRef.value.entities.removeById(userId);
        usersEntity.delete(userId);
    };

    const createDefaultUser = () => {
        userLocal = {
            id: nanoid(),
            name: getRandomName(randomNames),
            color: "blue",
            x: 0,
            y: 0,
            z: 0
        };
        usersList.set(userLocal.id, userLocal);
    };

    // hooks
    onMounted(() => {
        console.log("userCollabBar onMounted");
        if (!socket.connected) {
            createDefaultUser();
            return;
        }
        console.log("this msg shouldn't show up");
        let cameraPosWC = viewerRef.value.camera.positionWC.clone();
        userLocal = {
            id: nanoid(),
            name: getRandomName(randomNames),
            color: "blue",
            x: cameraPosWC.x,
            y: cameraPosWC.y,
            z: cameraPosWC.z
        };
        socket.emit("initialize", userLocal);
        // viewerRef.value.clock.onTick.addEventListener(() => {
        //     cameraPosWC = viewerRef.value.camera.positionWC.clone();
        //     userLocal.x = cameraPosWC.x;
        //     userLocal.y = cameraPosWC.y;
        //     userLocal.z = cameraPosWC.z;
        //     socket.emit("positionUpdate", userLocal);
        // });
    });

    return {
        usersList
    };
};
