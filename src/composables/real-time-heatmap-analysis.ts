import * as Cesium from "cesium";
import { HeatMapV2, RGBA } from "rust-wasm-heatmap";
import { memory } from "rust-wasm-heatmap/rust_wasm_heatmap_bg.wasm";
import Papa from "papaparse";

enum Mode {
    JS,
    WASM,
    ALL
}

export function createRealTimeHeatmap(viewer: Cesium.Viewer) {
    const defaultOption = {
        size: 1000,
        radius: 4,
        maxHeat: 10,
        gradient: ["00AAFF", "00FF00", "FFFF00", "FF8800", "FF0000"]
    };
    const extent = {
        minLng: 118.7,
        minLat: 31.95,
        maxLng: 118.9,
        maxLat: 32.2
    };
    const rgbas = parseGradient(defaultOption.gradient);

    const option = {
        ...defaultOption,
        gradient: rgbas,
        extent
    };

    const heatmap2 = HeatMapV2.new();
    const rgbas2 = rgbas.map((g) => RGBA.new(g.r, g.g, g.b, 255));
    heatmap2.set_gradients(rgbas2);
    heatmap2.set_radius(option.radius);
    heatmap2.set_max_heat(option.maxHeat);
    heatmap2.set_flip_y(true);
    heatmap2.set_size(
        option.size,
        extent.minLng,
        extent.minLat,
        extent.maxLng,
        extent.maxLat
    );
    const hw = heatmap2.width();
    const hh = heatmap2.height();

    const canvas = document.createElement("canvas");
    canvas.width = hw;
    canvas.height = hh;
    const ctx = canvas.getContext("2d");

    const entity = new Cesium.Entity({
        id: "heatmap",
        name: "heatmap",
        rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(
                extent.minLng,
                extent.minLat,
                extent.maxLng,
                extent.maxLat
            ),
            material: new Cesium.ImageMaterialProperty({
                // image: new Cesium.CallbackProperty(() => {
                //     return canvas;
                // }, false)
                image: canvas
            })
        }
    });

    viewer.entities.add(entity);
    viewer.flyTo(entity);

    const csvUrlArr = [
        "89.csv",
        "910.csv",
        "1011.csv",
        "1213.csv",
        "1314.csv",
        "1415.csv",
        "1516.csv",
        "1617.csv",
        "1718.csv",
        "1819.csv",
        "1920.csv",
        "2021.csv",
        "2122.csv",
        "2223.csv"
    ];
    let idx = 0;

    let mode = Mode.ALL;

    let statics: {
        js: number[];
        rust: number[];
    } = {
        js: [],
        rust: []
    };

    async function tick() {
        console.log("tick", idx);
        // console.time("tick once");
        Papa.parse("./heatpoint/" + csvUrlArr[idx], {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: async (results) => {
                console.log("points length", results.data.length);

                if (mode === Mode.ALL || mode === Mode.JS) {
                    const start_js = performance.now();
                    // console.time("init points");
                    const points_js = results.data.map((row: any) => {
                        return {
                            lat: row["lat"],
                            lng: row["lng"],
                            heat: row["heat"]
                        };
                    });
                    // console.timeEnd("init points");

                    // console.time("create heatmap");
                    const imageData_js = createHeatmapUseJs(points_js, option);
                    // console.timeEnd("create heatmap");

                    // const hw = imageData.width;
                    // const hh = imageData.height;

                    // ctx!.clearRect(0, 0, hw, hh);
                    // ctx!.strokeRect(0, 0, hw, hh);
                    // ctx!.putImageData(imageData, 0, 0);

                    // @ts-ignore
                    // entity.rectangle.material.image = canvas;
                    // console.timeEnd("tick once");
                    const end_js = performance.now();
                    statics.js.push(end_js - start_js);
                }

                if (mode === Mode.ALL || mode === Mode.WASM) {
                    const start_rust = performance.now();

                    // console.time("init points");
                    const points: number[] = [];
                    results.data.forEach((row: any) => {
                        points.push(row["lng"]);
                        points.push(row["lat"]);
                        points.push(row["heat"]);
                    });
                    const array = new Float64Array(points);
                    // console.timeEnd("init points");

                    heatmap2.clear_points();
                    heatmap2.reset();
                    heatmap2.add_points(array);

                    // console.time("create heatmap");
                    heatmap2.calc_heatmap();
                    const colorsPtr = heatmap2.color_values();
                    const uintc8 = new Uint8ClampedArray(
                        memory.buffer,
                        colorsPtr,
                        4 * hw * hh
                    );
                    const imageData = new ImageData(uintc8, hw, hh);
                    // console.timeEnd("create heatmap");
                    const end_rust = performance.now();
                    statics.rust.push(end_rust - start_rust);

                    // console.log("js average", statics.js.reduce((a, b) => a + b, 0) / statics.js.length);
                    // console.log("rust average", statics.rust.reduce((a, b) => a + b, 0) / statics.rust.length);

                    ctx!.clearRect(0, 0, hw, hh);
                    ctx!.strokeRect(0, 0, hw, hh);
                    ctx!.putImageData(imageData, 0, 0);

                    // canvas.toBlob(async (blob) => {
                    //     const buffer = await blob?.arrayBuffer();
                    //     const arrayBuffer = new Uint8Array(buffer!);
                    //     const blobUrl = URL.createObjectURL(
                    //         new Blob([arrayBuffer], { type: "image/png" })
                    //     );
                    //     image_uri = blobUrl;
                    // });
                    // image_uri = canvas;

                    // * when image is a constant property, it will not update: entity.rectangle.material.image.setValue(canvas);
                    // * so we directly set the image, but this will flicker
                    // @ts-ignore
                    entity.rectangle.material.image = canvas;
                }
                // console.timeEnd("tick once");
            }
        });
        idx = (idx + 1) % csvUrlArr.length;
    }

    // heatmap.free();

    let timer: number | null = null;

    const start = () => {
        if (!timer) {
            // @ts-ignore
            timer = setInterval(() => {
                tick();
            }, 1000);
        }
    };

    const stop = () => {
        if (timer) {
            clearInterval(timer);
        }
        console.log("counter", statics.js.length);
        console.log("js statics", statics.js);
        console.log("rust statics", statics.rust);
        console.log(
            "js average",
            statics.js.reduce((a, b) => a + b, 0) / statics.js.length
        );
        console.log(
            "rust average",
            statics.rust.reduce((a, b) => a + b, 0) / statics.rust.length
        );
    };

    const tickOnce = () => {
        tick();
    };

    return {
        start,
        stop,
        tickOnce,
        statics
    };
}

function createHeatmapUseJs(
    heatPoint: {
        lat: number;
        lng: number;
        heat: number;
    }[],
    option: {
        size: number;
        radius: number;
        maxHeat: number;
        gradient: { r: number; g: number; b: number }[];
        extent: {
            minLng: number;
            minLat: number;
            maxLng: number;
            maxLat: number;
        };
    }
): ImageData {
    const { size, radius, maxHeat: maxheat, gradient, extent } = option;
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
    return image;
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

function parseGradient(
    gradient: string[] | number[][]
): { r: number; g: number; b: number }[] {
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
}

function isUint8(num: number) {
    return typeof num == "number" && 0 <= num && num >= 255;
}
