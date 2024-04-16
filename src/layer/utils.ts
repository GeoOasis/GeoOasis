import {
    ArcGisMapServerImageryProvider,
    ImageryLayer,
    WebMapServiceImageryProvider,
    WebMapTileServiceImageryProvider,
    createWorldImageryAsync
} from "cesium";
import { GeoOasisBaseImageryLayer, GeoOasisImageryLayer } from "./layer";

export async function generateBingImageryFromLayer(
    layer: GeoOasisBaseImageryLayer
) {
    const bingImageryProvider = await createWorldImageryAsync();
    return new ImageryLayer(bingImageryProvider);
}

export async function generateArcgisImageryFromLayer(
    layer: GeoOasisBaseImageryLayer
) {
    const arcgisImageryProvider = await ArcGisMapServerImageryProvider.fromUrl(
        layer.url as string
    );
    return new ImageryLayer(arcgisImageryProvider);
}

export function generateWMTSImageryFromLayer(layer: GeoOasisBaseImageryLayer) {
    const wmtsImageryProvider = new WebMapTileServiceImageryProvider({
        url: layer.url as string,
        layer: "USGSShadedReliefOnly",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "default028mm",
        maximumLevel: 19,
        credit: "U. S. Geological Survey"
    });

    return new ImageryLayer(wmtsImageryProvider);
}

export function generateWMSImageryFromLayer(layer: GeoOasisImageryLayer) {
    const wmsImageryProvider = new WebMapServiceImageryProvider({
        url: layer.url as string,
        layers: layer.layer as string,
        credit: layer.credit,
        parameters: layer.parameters
    });
    return new ImageryLayer(wmsImageryProvider);
}
