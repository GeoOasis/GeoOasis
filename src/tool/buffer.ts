import buffer from "@turf/buffer";
import { BaseTool } from "./interface";

export class BufferTool implements BaseTool {
    name: string = "buffer";
    async execute(data: any, _options?: any): Promise<any> {
        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                const result = buffer(data, 500, { units: "miles" });
                resolve(result);
            }, 3000);
        });
    }
}
