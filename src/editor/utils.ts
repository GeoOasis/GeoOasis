import * as Y from "yjs";
import { KV } from "../type";

// export function getYMapValues<T>(
//     map: Y.Map<any>,
//     keys: (keyof T)[]
// ): Partial<T> {
//     const result: Partial<T> = {};
//     keys.forEach((key) => {
//         result[key] = map.get(key as string) as T[keyof T];
//     });
//     return result;
// }

export function getYMapValues<T>(
    yMap: Y.Map<any>,
    keys: readonly (keyof T)[]
): KV<T> {
    const result = {} as KV<T>;
    keys.forEach((key) => {
        const value = yMap.get(key as string);
        // if (value === undefined) {
        //     throw new Error(`Key ${String(key)} is missing in Y.Map`);
        // }
        result[key] = value;
    });
    return result;
}
