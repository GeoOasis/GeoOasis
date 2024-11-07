import {
    ArcGisMapServerImageryProvider,
    Cartographic,
    ImageryLayer,
    Rectangle,
    SingleTileImageryProvider,
    WebMapServiceImageryProvider,
    WebMapTileServiceImageryProvider,
    createWorldImageryAsync
} from "cesium";
import { GeoOasisImageryLayer } from "./layer";

export async function generateBingImageryFromLayer(
    layer: GeoOasisImageryLayer
) {
    const bingImageryProvider = await createWorldImageryAsync();
    return new ImageryLayer(bingImageryProvider);
}

export async function generateArcgisImageryFromLayer(
    layer: GeoOasisImageryLayer
) {
    const arcgisImageryProvider = await ArcGisMapServerImageryProvider.fromUrl(
        layer.url as string
    );
    return new ImageryLayer(arcgisImageryProvider);
}

export function generateWMTSImageryFromLayer(layer: GeoOasisImageryLayer) {
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

export async function generateSingleTileImageryFromLayer(
    layer: GeoOasisImageryLayer
) {
    console.log("singleTIle", layer);
    const singleTileImageryProvider = await SingleTileImageryProvider.fromUrl(
        layer.url as string,
        {
            rectangle: Rectangle.fromCartographicArray([
                Cartographic.fromDegrees(
                    layer.parameters.extent.minLng,
                    layer.parameters.extent.minLat
                ),
                Cartographic.fromDegrees(
                    layer.parameters.extent.maxLng,
                    layer.parameters.extent.maxLat
                )
            ])
        }
    );
    return new ImageryLayer(singleTileImageryProvider);
}
