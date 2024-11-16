import { onMounted } from "vue";
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
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { UserInfo } from "./useAwareness";

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

    // socket.on("userJoined", (user: User) => {
    //     console.log("userJoined::", user);
    //     usersList.set(user.id, user);
    //     const userEntity = createUserEntity(user.id);
    //     if (userEntity !== undefined) {
    //         addUserEntity(userEntity);
    //         usersEntity.set(user.id, userEntity);
    //     }
    // });
    // socket.on("userMoved", (user: User) => {
    //     console.log("userMoved::", user);
    //     let userTemp = usersList.get(user.id);
    //     if (userTemp !== undefined) {
    //         console.log("收到move:: ", userTemp.id);
    //         userTemp.x = user.x;
    //         userTemp.y = user.y;
    //         userTemp.z = user.z;
    //     }
    // });
    // socket.on("userLeft", (user: User) => {
    //     usersList.delete(user.id);
    //     removeUserEntity(user.id);
    //     usersEntity.delete(user.id);
    // });
    // socket.on("UserData", (users: any) => {
    //     console.log("UserData::", users);
    //     usersList.clear();
    //     users.forEach((user: any) => {
    //         usersList.set(user[0], user[1]);
    //         if (user[0] === userLocal.id) return;
    //         const userEntity = createUserEntity(user[0]);
    //         if (userEntity !== undefined) {
    //             addUserEntity(userEntity);
    //             usersEntity.set(user[0], userEntity);
    //         }
    //     });
    // });

    // // methods
    // const createUserEntity = (userId: string) => {
    //     const user = usersList.get(userId);
    //     if (user === undefined) return;
    //     console.log("createUserEntity::", user.id);
    //     const userEntity = new Entity({
    //         id: user.id,
    //         // name: user.name,
    //         // @ts-ignore
    //         position: new CallbackProperty((time, result) => {
    //             return Cartesian3.fromElements(user.x, user.y, user.z, result);
    //         }, false),
    //         // position: Cartesian3.fromElements(user.x, user.y, user.z),
    //         box: {
    //             dimensions: new Cartesian3(400.0, 300.0, 500.0),
    //             material: Color.YELLOW
    //         }
    //     });
    //     return userEntity;
    // };

    // const addUserEntity = (entity: Entity) => {
    //     viewerRef.value.entities.add(entity);
    // };

    // const removeUserEntity = (userId: string) => {
    //     viewerRef.value.entities.removeById(userId);
    // };

    return {
        userList
    };
};
