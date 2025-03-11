import { IonResource } from "cesium";
import { nanoid } from "nanoid";
import * as Y from "yjs";

export type Asset = {
    id: string;
    name: string;
    url?: string;
    data?: string | Uint8Array;
    ion?: boolean;
};

export const defaultAsset: Asset[] = [
    {
        id: "asset-0",
        name: "sign",
        url: "sign.glb"
    },
    {
        id: "asset-1",
        name: "car",
        url: "car.glb"
    },
    {
        id: "asset-2",
        name: "airplane",
        url: "Cesium_Air.glb"
    }
];

export class AssetLibrary {
    public assetArray: Y.Array<Asset>;
    public urlMap: Map<string, string> = new Map();
    constructor(doc: Y.Doc) {
        this.assetArray = doc.getArray("AssetLibrary");
        this.init();
    }

    init() {
        for (const asset of defaultAsset) {
            this.urlMap.set(asset.id, `./${asset.url as string}`);
        }
        const createURLhandler = this.createURLhandler.bind(this);
        this.assetArray.observe(createURLhandler);
    }

    addAsset(option: {
        name: string;
        data?: Uint8Array;
        url?: string;
        ion?: boolean;
    }) {
        const asset = {
            id: nanoid(),
            name: option.name,
            url: option.url,
            data: option.data,
            ion: option.ion
        };
        this.assetArray.push([asset]);
    }

    async getAssetUrl(
        assetId: string
    ): Promise<string | IonResource | undefined> {
        const asset = this.assetArray
            .toArray()
            .find((asset) => asset.id === assetId);
        if (asset && asset.ion) {
            const resource = await IonResource.fromAssetId(Number(asset.url));
            return resource;
        }
        return this.urlMap.get(assetId);
    }

    getAssetId(index: number): string | undefined {
        let assetId;
        if (index < defaultAsset.length) {
            assetId = defaultAsset[index].id;
        } else {
            assetId = this.assetArray.get(index - defaultAsset.length).id;
        }
        return assetId;
    }

    createURLhandler(
        _events: Y.YArrayEvent<Asset>,
        _transactions: Y.Transaction
    ) {
        this.assetArray.forEach((asset) => {
            if (!this.urlMap.has(asset.id)) {
                if (asset.data && asset.data instanceof Uint8Array) {
                    const glbBlob = new Blob([asset.data], {
                        type: "model/gltf-binary"
                    });
                    const uri = URL.createObjectURL(glbBlob);
                    this.urlMap.set(asset.id, uri);
                } else if (asset.url) {
                    this.urlMap.set(asset.id, asset.url);
                }
            }
        });
    }
}
