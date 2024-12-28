import { BaseTool } from "./interface";
import { HeatMap, RGBA } from "rust-wasm-heatmap";
import { memory } from "rust-wasm-heatmap/rust_wasm_heatmap_bg.wasm";

export class HeatMapTool implements BaseTool {
    name: string = "heatmap";
    async execute(data: any, options?: any): Promise<any> {
        const radius: number = options.radius; // 热力点影响半径
        const gradient: string[] = options.gradient; // 热力图色带
        const maxHeat: number = options.maxHeat; // 热力图最大热力值
        const size: number = options.size; // 热力图经度分辨率
        const extent: {
            minLng: number;
            minLat: number;
            maxLng: number;
            maxLat: number;
        } = options.extent;
        const mode = options.mode;
        const heatPoint: { lat: number; lng: number; heat: number }[] = data;

        const gradientParse = parseGradient(gradient);
        console.log("heatmap options", options);

        return new Promise((resolve, _reject) => {
            resolve(
                createHeat(
                    mode,
                    size,
                    radius,
                    maxHeat,
                    gradientParse,
                    heatPoint,
                    extent
                )
            );
        });
    }
}

const parseGradient = (
    gradient: string[] | number[][]
): { r: number; g: number; b: number }[] => {
    return gradient.map((color) => {
        if (color.toString().match(/^#?[0-9a-f]{3}$/i)) {
            color = color.toString().replace(/^#?(.)(.)(.)$/, "$1$1$2$2$3$3");
        }
        if (typeof color === "string") {
            if (color.match(/^#?[0-9a-f]{6}$/i)) {
                // @ts-ignore
                color = color
                    .match(/^#?(..)(..)(..)$/)
                    .slice(1)
                    .map((n) => parseInt(n, 16));
            } else {
                throw Error(`Invalid color format (${color}).`);
            }
        } else if (color instanceof Array) {
            if (
                !(
                    color.length &&
                    isUint8(color[0]) &&
                    isUint8(color[1]) &&
                    isUint8(color[2])
                )
            ) {
                throw Error(`Invalid color format (${JSON.stringify(color)}).`);
            }
        } else {
            throw Error(`Invalid color object (${JSON.stringify(color)}).`);
        }
        return { r: color[0], g: color[1], b: color[2] };
    });
};

function isUint8(num: number) {
    return typeof num == "number" && 0 <= num && num >= 255;
}

const heatToColor = (
    heat: number,
    gradient: { r: number; g: number; b: number }[],
    maxHeat: number
) => {
    let r = 0,
        g = 0,
        b = 0,
        a = 0;
    const gradientSteps = gradient.length;
    const stepLens = maxHeat / gradientSteps;

    const heatStepF = Math.floor(heat / stepLens);
    const stepPos = heat / stepLens - heatStepF;

    if (heatStepF >= gradientSteps) {
        r = gradient[gradientSteps - 1].r;
        g = gradient[gradientSteps - 1].g;
        b = gradient[gradientSteps - 1].b;
        a = 255;
    } else {
        if (heatStepF === 0) {
            r = gradient[0].r;
            g = gradient[0].g;
            b = gradient[0].b;
            a = Math.round(255 * stepPos); // 我以为会使用插值
        } else {
            const gradPosInv = 1 - stepPos;
            r = Math.round(
                gradient[heatStepF - 1].r * gradPosInv +
                    gradient[heatStepF].r * stepPos
            );
            g = Math.round(
                gradient[heatStepF - 1].g * gradPosInv +
                    gradient[heatStepF].g * stepPos
            );
            b = Math.round(
                gradient[heatStepF - 1].b * gradPosInv +
                    gradient[heatStepF].b * stepPos
            );
            a = 255;
        }
    }

    return [r, g, b, a];
};

const createHeatmapUseJs = (
    size: number,
    radius: number,
    maxheat: number,
    gradient: { r: number; g: number; b: number }[],
    heatPoint: { lat: number; lng: number; heat: number }[],
    extent: {
        minLng: number;
        minLat: number;
        maxLng: number;
        maxLat: number;
    }
): ImageData => {
    // console.time("createHeatmapUseJs");
    const { minLng, minLat, maxLng, maxLat } = extent;

    const dLng = maxLng - minLng;
    const dLat = maxLat - minLat;
    const perPixel = dLng / size;
    const sizeY = Math.ceil(dLat / perPixel);

    const heatMatrix = new Array(sizeY)
        .fill(0)
        .map(() => new Array(size).fill(0));

    // 计算像素坐标以及热力值
    for (let i = 0; i < heatPoint.length; i++) {
        const { lat, lng, heat } = heatPoint[i];
        const x = Math.floor((lng - minLng) / perPixel);
        const y = Math.floor((lat - minLat) / perPixel);

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < size && ny >= 0 && ny < sizeY) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const weight = 1 - distance / radius;
                    if (weight < 0) continue;
                    heatMatrix[ny][nx] += heat * weight;
                }
            }
        }
    }

    // 计算颜色
    const uintc8 = new Uint8ClampedArray(size * sizeY * 4);
    for (let y = 0; y < sizeY; y++) {
        for (let x = 0; x < size; x++) {
            const [r, g, b, a] = heatToColor(
                heatMatrix[y][x],
                gradient,
                maxheat
            );
            uintc8[(y * size + x) * 4 + 0] = r;
            uintc8[(y * size + x) * 4 + 1] = g;
            uintc8[(y * size + x) * 4 + 2] = b;
            uintc8[(y * size + x) * 4 + 3] = a;
        }
    }
    const image = new ImageData(uintc8, size, sizeY);
    // console.timeEnd("createHeatmapUseJs");
    return image;
};

const creatHeatmapUseWasm = (
    size: number,
    radius: number,
    maxheat: number,
    gradient: { r: number; g: number; b: number }[],
    heatPoint: { lat: number; lng: number; heat: number }[],
    extent: {
        minLng: number;
        minLat: number;
        maxLng: number;
        maxLat: number;
    }
): ImageData => {
    // console.time("creatHeatmapUseWasm");
    const heatmap = HeatMap.new(
        size,
        radius,
        extent.minLng,
        extent.minLat,
        extent.maxLng,
        extent.maxLat,
        maxheat
    );
    const rgbas = gradient.map((color) =>
        RGBA.new(color.r, color.g, color.b, 255)
    );
    heatmap.set_gradients(rgbas);
    const hw = heatmap.width();
    const hh = heatmap.height();

    const tmp: number[] = [];
    heatPoint.forEach(p => {
        tmp.push(p.lng)
        tmp.push(p.lat)
        tmp.push(p.heat)
    })
    heatmap.add_points_v2(new Float64Array(tmp));

    // const tmpPoints = heatPoint.map((p) => HeatPoint.new(p.lng, p.lat, p.heat));
    // heatmap.add_points(tmpPoints);

    const colorsPtr = heatmap.color_values();
    const colorsArr = new Uint8ClampedArray(
        memory.buffer,
        colorsPtr,
        4 * hw * hh
    );
    console.log(colorsArr);
    const imageData = new ImageData(colorsArr, hw, hh);
    // console.timeEnd("creatHeatmapUseWasm");
    // ? free
    return imageData;
};

const createHeat = (
    mode: "wasm" | "js",
    size: number,
    radius: number,
    maxheat: number,
    gradient: { r: number; g: number; b: number }[],
    heatPoint: { lat: number; lng: number; heat: number }[],
    extent: {
        minLng: number;
        minLat: number;
        maxLng: number;
        maxLat: number;
    }
) => {
    if (mode === "js") {
        return createHeatmapUseJs(
            size,
            radius,
            maxheat,
            gradient,
            heatPoint,
            extent
        );
    } else if (mode === "wasm") {
        return creatHeatmapUseWasm(
            size,
            radius,
            maxheat,
            gradient,
            heatPoint,
            extent
        );
    }
};
