import * as Y from "yjs";

export type KV<T> = { [K in keyof T]: T[K] };

export type KVMap<T> = Map<keyof T, T[keyof T]>;

export type YElement = Y.Map<unknown>; // like ObjMap<KV<Element>>

export type YElements = Y.Map<YElement>; // <id, yElement>