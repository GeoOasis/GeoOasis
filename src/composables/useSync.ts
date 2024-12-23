import { onMounted, onUnmounted, ShallowRef, shallowRef } from "vue";
import * as Y from "yjs";

export const useSyncArray = <T>(yarray: Y.Array<T>) => {
    const array = shallowRef<T[]>(yarray.toArray());
    onMounted(() => {
        yarray.observe(handler);
    });
    onUnmounted(() => {
        yarray.unobserve(handler);
    });
    const handler = () => {
        array.value = yarray.toArray();
    };
    return array;
};

type MapRefValue<R> = { [K in keyof R]: ShallowRef<R[K]> };

export const useSyncMap = <R extends Record<string, unknown>>(
    ymap: Y.Map<any>,
    keys: readonly (keyof R)[]
) => {
    const map = {} as MapRefValue<R>;
    for (const key of keys) {
        map[key] = shallowRef(ymap.get(key as string));
    }
    onMounted(() => {
        ymap.observe(handler);
    });
    onUnmounted(() => {
        ymap.unobserve(handler);
    });
    const handler = ({ changes }: Y.YMapEvent<any>) => {
        changes.keys.forEach((_change, key) => {
            map[key].value = ymap.get(key);
        });
    };
    return map;
};
