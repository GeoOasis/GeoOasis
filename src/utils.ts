export enum FileType {
    JSON = ".json",
    GEOJSON = ".geojson",
    PNGImage = ".png",
    JPEGImage = ".jpg",
    GIFImage = ".gif",
    BMPImage = ".bmp",
    SVGImage = ".svg",
    WordDocument = ".docx",
    ExcelSpreadsheet = ".xlsx",
    TextFile = ".txt",
    GLTF = ".gltf",
    GLB = ".glb"
}

export const getFileType = (fileName: string): FileType | undefined => {
    const extension = fileName.slice(fileName.lastIndexOf("."));
    if (!extension || extension === fileName) {
        return undefined;
    }

    return Object.values(FileType).find(
        (type) => type === extension.toLowerCase()
    );
};

export interface CesiumPrimitive {
    update: (frameState?: any) => void;
    isDestroyed: () => boolean;
    destroy: () => void;
}
