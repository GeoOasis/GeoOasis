import * as Cesium from "cesium";
import { HeatMap, RGBA } from "rust-wasm-heatmap";
import { memory } from "rust-wasm-heatmap/rust_wasm_heatmap_bg.wasm";
import Papa from "papaparse";

export function createRealTimeHeatmap(viewer: Cesium.Viewer) {
    const extent: any = {};
    extent.minLng = 118.7;
    extent.minLat = 31.95;
    extent.maxLng = 118.9;
    extent.maxLat = 32.2;
    const defaultOption = {
        size: 2000,
        radius: 5,
        maxHeat: 10,
        gradient: ["00AAFF", "00FF00", "FFFF00", "FF8800", "FF0000"]
    };
    const rgbas = parseGradient(defaultOption.gradient).map((g) =>
        RGBA.new(g.r, g.g, g.b, 255)
    );

    const option = {
        ...defaultOption,
        extent
    };

    const heatmap = HeatMap.new(
        option.size,
        option.radius,
        option.extent.minLng,
        option.extent.minLat,
        option.extent.maxLng,
        option.extent.maxLat,
        option.maxHeat
    );
    heatmap.set_gradients(rgbas);
    const hw = heatmap.width();
    const hh = heatmap.height();
    console.log("heatmap's width, height", hw, hh);

    const canvas = document.createElement("canvas");

    // document.body.appendChild(canvas);
    // canvas.style.position = "absolute";
    // canvas.style.bottom = "0px";
    // canvas.style.right = "0px";
    // canvas.style.width = "300px";
    // canvas.style.height = "300px";
    // canvas.style.pointerEvents = "none";
    // canvas.style.zIndex = "9999";

    canvas.width = hw;
    canvas.height = hh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    };

    const tickOnce = () => {
        tick();
    };

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

    async function tick() {
        console.log("tick", idx);
        console.time("tick");
        Papa.parse("./heatpoint/" + csvUrlArr[idx], {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: async (results) => {
                console.time("init points");
                const points = results.data.map((row: any) => {
                    return [row["lng"], row["lat"], row["heat"]];
                });
                console.timeEnd("init points");

                const array = new Float64Array(points.flat());

                heatmap.reset();
                console.time("add points");
                heatmap.add_points_v2(array);
                console.timeEnd("add points");

                const colorsPtr = heatmap.color_values();
                console.log("colorsPtr", colorsPtr);
                const colorsArr = new Uint8ClampedArray(
                    memory.buffer,
                    colorsPtr,
                    4 * hw * hh
                );
                const imageData = new ImageData(colorsArr, hw, hh);

                // const bitmap = await createImageBitmap(imageData, {
                //     imageOrientation: "flipY"
                // });

                ctx!.clearRect(0, 0, hw, hh);
                ctx!.strokeRect(0, 0, hw, hh);
                ctx!.putImageData(imageData, 0, 0);

                // ctx!.drawImage(bitmap, 0, 0);
                // bitmap.close();
                // canvas.toBlob(async (blob) => {
                //     const buffer = await blob?.arrayBuffer();
                //     const arrayBuffer = new Uint8Array(buffer!);
                //     const blobUrl = URL.createObjectURL(
                //         new Blob([arrayBuffer], { type: "image/png" })
                //     );
                //     image_uri = blobUrl;
                //     console.timeEnd("tick");
                // });
                // image_uri = canvas;

                // entity.rectangle.material.image.setValue(canvas); // don't work when image is constant property

                // @ts-ignore
                entity.rectangle.material.image = canvas;
                console.timeEnd("tick");
            }
        });
        idx = (idx + 1) % csvUrlArr.length;
    }
    // heatmap.free();

    return {
        start,
        stop,
        tickOnce
    };
}

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
