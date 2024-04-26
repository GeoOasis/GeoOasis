import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { Editor } from "./editor";
import { Hocuspocus_URL } from "../contants";
import { ElementAddedEvent, ElementMuatedEvent } from "./type";

export class BindingYjs {
    private yjsProvider: HocuspocusProvider;
    private doc: Y.Doc;
    private editor: Editor;
    private sharedElementsMap: Y.Map<any>;
    private sharedLayersMap: Y.Map<any>;
    sharedAppStateMap: Y.Map<any>;
    undoManager: Y.UndoManager;

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
        this.sharedLayersMap = this.doc.getMap("yjsLayersMap");
        this.sharedAppStateMap = this.doc.getMap("yjsAppStateMap");
        this.undoManager = new Y.UndoManager(this.sharedElementsMap);
    }

    init() {
        const self = this;
        this.sharedElementsMap.observeDeep((events, transactions) =>
            self.handleYjsElementsEvents(events, transactions)
        );
        this.sharedLayersMap.observeDeep((events, transactions) => {
            self.handleYjsLayersEvents(events, transactions);
        });

        this.editor.addEventListener("elementAdded", (event) =>
            self.handleElementAdded(event as ElementAddedEvent)
        );
        this.editor.addEventListener("elementMutated", (event) =>
            self.handleElementMutated(event as ElementMuatedEvent)
        );
        this.editor.addEventListener("layerAdded", (event) => {
            self.handleLayerAdded(event);
        });
    }

    handleYjsElementsEvents(
        events: Y.YEvent<any>[],
        transaction: Y.Transaction
    ) {
        console.log("TRANSACTION is: ", transaction);
        // * if transaction is form local undoManager, then handle event.
        if (transaction.origin === this.undoManager) {
            events.map((e) => {
                e.changes.keys.forEach((change, key) => {
                    console.log(
                        `From UndoManager, this change 's key is ${key}`
                    );
                    if (change.action === "add") {
                        console.log("add");
                        handleAddFromYjs(
                            this.editor,
                            this.sharedElementsMap,
                            key
                        );
                    } else if (change.action === "delete") {
                        console.log("delete");
                        handleDeleteFromYjs(this.editor, key);
                    } else if (change.action === "update") {
                        console.log("update");
                        handleUpdateFromYjs(
                            this.editor,
                            this.sharedElementsMap,
                            key,
                            e
                        );
                    }
                });
            });
        }
        // * if transaciton is from remote client, then handle event.
        if (!transaction.local) {
            console.log("Yjs Elements remote transaction is received");
            events.map((e) => {
                console.log("event is ", e);
                // @ts-ignore
                e.changes.keys.forEach((change, key) => {
                    console.log(`this change's key is ${key}`);
                    if (change.action === "add") {
                        handleAddFromYjs(
                            this.editor,
                            this.sharedElementsMap,
                            key
                        );
                    } else if (change.action === "update") {
                        handleUpdateFromYjs(
                            this.editor,
                            this.sharedElementsMap,
                            key,
                            e
                        );
                    } else if (change.action === "delete") {
                        handleDeleteFromYjs(this.editor, key);
                    }
                });
            });
        }
    }
    // TODO 补全event：any类型
    handleElementAdded(event: ElementAddedEvent) {
        if (event.detail.local) {
            const element = new Y.Map();
            for (const key in event.detail.element) {
                // @ts-ignore
                const value = event.detail.element[key];
                element.set(key, value);
            }
            // * 在element添加到ydoc之后，才能用get方法获得value
            let id = event.detail.element.id;
            this.sharedElementsMap.set(id, element);
        }
    }

    handleElementMutated(event: ElementMuatedEvent) {
        if (event.detail.local) {
            const update = event.detail.update;
            for (const key in update) {
                const value = update[key];
                this.sharedElementsMap.get(event.detail.id).set(key, value);
            }
        }
    }

    handleYjsLayersEvents(events: Y.YEvent<any>[], transaction: Y.Transaction) {
        if (!transaction.local) {
            console.log("Yjs Layers remote transaction is received");
            events.map((e) => {
                console.log("event is ", e);
                // @ts-ignore
                e.changes.keys.forEach((change, key) => {
                    console.log(`this change's key is ${key}`);
                    if (change.action === "add") {
                        const remoteLayer = this.sharedLayersMap
                            .get(key)
                            .toJSON();
                        this.editor.addLayer(remoteLayer, false);
                    } else if (change.action === "update") {
                    } else if (change.action === "delete") {
                    }
                });
            });
        }
    }

    handleLayerAdded(event: any) {
        if (event.detail.local) {
            const layer = new Y.Map();
            for (const key in event.detail.layer) {
                // @ts-ignore
                const value = event.detail.layer[key];
                layer.set(key, value);
            }
            this.sharedLayersMap.set(event.detail.layer.id, layer);
        }
    }
}

// 根据Yjs Event的信息，调用editor的函数来执行命令
const handleAddFromYjs = (
    editor: Editor,
    sharedType: Y.Map<any>,
    key: string
) => {
    const remoteElement = sharedType.get(key).toJSON();
    // ! 给addElment传递一个参数，listener可以通过该布尔值决定是否修改ydoc
    editor.addElement(remoteElement, false);
};

const handleUpdateFromYjs = (
    editor: Editor,
    sharedType: Y.Map<any>,
    key: string,
    e: Y.YEvent<any>
) => {
    console.log("update", sharedType.get(key));
    const element = {
        id: e.target.get("id"),
        type: e.target.get("type")
    };
    const update = {
        [key]: e.target.get(key)
    };
    editor.mutateElement(element as any, update, false);
};

const handleDeleteFromYjs = (editor: Editor, key: string) => {
    editor.deleteElement(key, false);
};
