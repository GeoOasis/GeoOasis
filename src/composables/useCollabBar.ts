import { onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { nanoid } from "nanoid";
import {
    CallbackProperty,
    Cartesian3,
    Color,
    Entity,
    HeadingPitchRange,
    Transforms
} from "cesium";
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
    // * 通过userLocal和usersList来和服务端通信
    const usersList = reactive<UserList>(new Map());
    const usersEntity = new Map<string, Entity>();
    let userLocal: User = {} as User;
    let cameraPosWCOld: Cartesian3;

    // store
    const viewerStore = useViewerStore();
    const { viewerRef } = storeToRefs(viewerStore);

    // * 所有组件挂载完之后 socket.on("connect",)才被触发
    // @ts-ignore
    const socket = io(SERVER_URL);
    console.log("socket initial!");

    socket.on("connect", () => {
        console.log("connect to server!");
        connectServer();
    });

    socket.on("userJoined", (user: User) => {
        console.log("userJoined::", user);
        usersList.set(user.id, user);
        const userEntity = createUserEntity(user.id);
        if (userEntity !== undefined) {
            addUserEntity(userEntity);
            usersEntity.set(user.id, userEntity);
        }
    });
    socket.on("userMoved", (user: User) => {
        console.log("userMoved::", user);
        let userTemp = usersList.get(user.id);
        if (userTemp !== undefined) {
            console.log("收到move:: ", userTemp.id);
            userTemp.x = user.x;
            userTemp.y = user.y;
            userTemp.z = user.z;
        }
    });
    socket.on("userLeft", (user: User) => {
        usersList.delete(user.id);
        removeUserEntity(user.id);
        usersEntity.delete(user.id);
    });
    socket.on("UserData", (users: any) => {
        console.log("UserData::", users);
        usersList.clear();
        users.forEach((user: any) => {
            usersList.set(user[0], user[1]);
            if (user[0] === userLocal.id) return;
            const userEntity = createUserEntity(user[0]);
            if (userEntity !== undefined) {
                addUserEntity(userEntity);
                usersEntity.set(user[0], userEntity);
            }
        });
    });

    // methods
    const createUserEntity = (userId: string) => {
        const user = usersList.get(userId);
        if (user === undefined) return;
        console.log("createUserEntity::", user.id);
        const userEntity = new Entity({
            id: user.id,
            // name: user.name,
            // @ts-ignore
            position: new CallbackProperty((time, result) => {
                return Cartesian3.fromElements(user.x, user.y, user.z, result);
            }, false),
            // position: Cartesian3.fromElements(user.x, user.y, user.z),
            box: {
                dimensions: new Cartesian3(400.0, 300.0, 500.0),
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

    const connectServer = () => {
        let cameraPosWC = viewerRef.value.camera.positionWC;
        cameraPosWCOld = cameraPosWC.clone();
        userLocal.x = cameraPosWC.x;
        userLocal.y = cameraPosWC.y;
        userLocal.z = cameraPosWC.z;
        socket.emit("initialize", userLocal);
        // TODO 更新这块还有问题
        viewerRef.value.clock.onTick.addEventListener(() => {
            // 位置不变的时候不发送事件
            let cameraPosWC = viewerRef.value.camera.positionWC;
            if (cameraPosWCOld.equals(cameraPosWC)) return;
            cameraPosWCOld = cameraPosWC.clone();
            userLocal.x = cameraPosWC.x;
            userLocal.y = cameraPosWC.y;
            userLocal.z = cameraPosWC.z;
            console.log("主动move:: ", userLocal.id);
            socket.emit("positionUpdate", userLocal);
        });
    };

    // TODO 是否需要创建一个update函数，更根据userslist中的数据来更新viewer渲染

    // hooks
    onMounted(() => {
        console.log("userCollabBar onMounted");
        // look at a point
        const center = Cartesian3.fromRadians(
            2.4213211833389243,
            0.6171926869414084,
            3626.0426275055174
        );
        const transform = Transforms.eastNorthUpToFixedFrame(center);
        // viewerRef.value.camera.lookAtTransform(
        //     transform,
        //     new HeadingPitchRange(0, -Math.PI / 4, 2900)
        // );
        createDefaultUser();
    });

    return {
        usersList
    };
};
