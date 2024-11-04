import { ToolBoxBase, BaseTool } from "./interface";

export class ToolBox implements ToolBoxBase {
    private tools: Map<string, BaseTool> = new Map();
    registerTool(tool: BaseTool): void {
        this.tools.set(tool.name, tool);
    }
    getTool(name: string): BaseTool | undefined {
        return this.tools.get(name);
    }
    runTool(toolName: string, data: any, options: any): Promise<any> {
        const tool = this.getTool(toolName);
        if (!tool) {
            throw new Error(`not register this ${toolName} tool`);
        }
        return tool.execute(data, options);
    }
}
