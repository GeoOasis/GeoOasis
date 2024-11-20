import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

export const createHocuspocusProvider = (
    url: string,
    roomName: string,
    doc: Y.Doc
): HocuspocusProvider => {
    return new HocuspocusProvider({
        url: url,
        name: roomName,
        document: doc,
        onOpen() {
            console.log("hocuspocus open successfully");
        },
        onConnect() {
            console.log("provider connect to the server successfully");
        }
    });
};
