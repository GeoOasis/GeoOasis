import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { Editor } from "./editor";
import { Hocuspocus_URL } from "../contants";
import { GeoOasisPointElement } from "../element/element";

export class BindingYjs {
    private yjsProvider: HocuspocusProvider;
    private doc: Y.Doc;
    private editor: Editor;
    private sharedMap: Y.Map<any>;

    constructor(editor: Editor) {
        this.editor = editor;
        this.yjsProvider = new HocuspocusProvider({
            url: Hocuspocus_URL,
            name: "test",
            onOpen() {
                console.log("hocuspocus open");
            },
            onConnect() {
                console.log("provider connect to the server successfully");
            }
        });
        this.doc = this.yjsProvider.document;
        this.sharedMap = this.doc.getMap("yjsElementsMap");
        console.log(this.sharedMap);

        this.init();
    }

    init() {
        // TODO 如果把handle函数作为类的方法，会有this指向的问题
        this.sharedMap.observeDeep((events, transaction) => {
            // ! 如果不是local，那么处理events
            if (!transaction.local) {
                console.log("remote transaction is received");
                events.map((e) => {
                    e.changes.keys.forEach((change, key) => {
                        console.log(`this change's key is ${key}`);
                        if (change.action === "add") {
                            // ! 给addElment传递一个参数，listener可以通过该布尔值决定是否修改ydoc
                            this.editor.addElement(
                                this.sharedMap.get(key),
                                false
                            );
                            console.log("add", this.sharedMap.get(key));
                        } else if (change.action === "update") {
                            // applyUpdateEventToEditor();
                            console.log("update", this.sharedMap.get(key));
                        } else if (change.action === "delete") {
                            // applyDeleteEventToEditor();
                            console.log("delete", this.sharedMap.get(key));
                        }
                    });
                });
            }
        });
        // add callback to editor
        this.editor.addEventListener("elementAdded", (event) => {
            // @ts-ignore
            if (event.detail.local) {
                // @ts-ignore
                this.sharedMap.set(event.detail.id, event.detail);
            }
        });
    }

    pushElement() {
        console.log("push element");

        console.log(this.editor);

        const element: GeoOasisPointElement = {
            id: "1",
            name: "test",
            show: true,
            type: "point",
            description: "",
            // @ts-ignore
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            pixelSize: 10,
            color: "white"
        };

        this.sharedMap.set(element.id, element);
    }
}
