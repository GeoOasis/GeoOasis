import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { Editor } from "./editor";
import { Hocuspocus_URL } from "../contants";

export class BindingYjs {
    private yjsProvider: HocuspocusProvider;
    private doc: Y.Doc;
    private editor: Editor;
    private sharedElementsMap: Y.Map<any>;

    constructor(editor: Editor) {
        let self = this;
        this.editor = editor;
        this.yjsProvider = new HocuspocusProvider({
            url: Hocuspocus_URL,
            name: "test",
            onOpen() {
                console.log("hocuspocus open");
            },
            onConnect() {
                console.log("provider connect to the server successfully");
                self.init();
            }
        });
        this.doc = this.yjsProvider.document;
        this.sharedElementsMap = this.doc.getMap("yjsElementsMap");
    }

    init() {
        const self = this;
        this.sharedElementsMap.observeDeep((events, transactions) =>
            self.handleYjsEvents(events, transactions)
        );
        this.editor.addEventListener("elementAdded", (event) =>
            self.handleElementAdded(event)
        );
        this.editor.addEventListener("elementMutated", (event) =>
            self.handleElementMutated(event)
        );
    }

    handleYjsEvents(events: Y.YEvent<any>[], transaction: Y.Transaction) {
        // ! 如果不是local，那么处理events
        if (!transaction.local) {
            console.log("remote transaction is received");
            events.map((e) => {
                console.log("event is ", e);
                // @ts-ignore
                e.changes.keys.forEach((change, key) => {
                    console.log(`this change's key is ${key}`);
                    if (change.action === "add") {
                        const remoteElement = this.sharedElementsMap
                            .get(key)
                            .toJSON();
                        // ! 给addElment传递一个参数，listener可以通过该布尔值决定是否修改ydoc
                        this.editor.addElement(remoteElement, false);
                    } else if (change.action === "update") {
                        console.log("update", this.sharedElementsMap.get(key));
                        const element = {
                            id: e.target.get("id"),
                            type: e.target.get("type")
                        };
                        const update = {
                            [key]: e.target.get(key)
                        };
                        this.editor.mutateElement(
                            element as any,
                            update,
                            false
                        );
                    } else if (change.action === "delete") {
                        // applyDeleteEventToEditor();
                        console.log("delete", this.sharedElementsMap.get(key));
                    }
                });
            });
        }
    }
    // TODO 补全event：any类型
    handleElementAdded(event: any) {
        console.log(this);

        if (event.detail.local) {
            const element = new Y.Map();
            for (const key in event.detail.element) {
                const value = event.detail.element[key];
                element.set(key, value);
            }
            // * 在element添加到ydoc之后，才能用get方法获得value
            let id = event.detail.element.id;
            this.sharedElementsMap.set(id, element);
        }
    }

    handleElementMutated(event: any) {
        if (event.detail.local) {
            const update = event.detail.update;
            for (const key in update) {
                const value = update[key];
                this.sharedElementsMap.get(event.detail.id).set(key, value);
            }
        }
    }
}
