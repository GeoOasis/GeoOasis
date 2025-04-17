import {
    Viewer,
    EllipsoidTerrainProvider,
    Terrain,
    ArcGISTiledElevationTerrainProvider,
    CustomHeightmapTerrainProvider
} from "cesium";

export enum TerrainOption {
    ELLIPSOID = "ELLIPSOID",
    CUSTOMHEIGHTMAP = "CUSTOMHEIGHTMAP",
    CESIUMWORLD = "CESIUMWORLD",
    ARCGIS = "ARCGIS"
}

const ellipsoidProvider = new EllipsoidTerrainProvider();

const customHeightmapWidth = 32;
const customHeightmapHeight = 32;
const customHeightmapProvider = new CustomHeightmapTerrainProvider({
    width: customHeightmapWidth,
    height: customHeightmapHeight,
    callback: function (x, y, level) {
        const width = customHeightmapWidth;
        const height = customHeightmapHeight;
        const buffer = new Float32Array(width * height);

        for (let yy = 0; yy < height; yy++) {
            for (let xx = 0; xx < width; xx++) {
                const u = (x + xx / (width - 1)) / Math.pow(2, level);
                const v = (y + yy / (height - 1)) / Math.pow(2, level);

                const heightValue = 4000 * (Math.sin(8000 * v) * 0.5 + 0.5);

                const index = yy * width + xx;
                buffer[index] = heightValue;
            }
        }

        return buffer;
    }
});

export function setTerrain(viewer: Viewer, terrain: TerrainOption) {
    switch (terrain) {
        case TerrainOption.ELLIPSOID:
            viewer.terrainProvider = ellipsoidProvider;
            break;
        case TerrainOption.CUSTOMHEIGHTMAP:
            viewer.terrainProvider = customHeightmapProvider;
            break;
        case TerrainOption.CESIUMWORLD:
            viewer.scene.setTerrain(Terrain.fromWorldTerrain());
            break;
        case TerrainOption.ARCGIS:
            viewer.scene.setTerrain(
                new Terrain(
                    ArcGISTiledElevationTerrainProvider.fromUrl(
                        "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
                    )
                )
            );
            break;
    }
}
