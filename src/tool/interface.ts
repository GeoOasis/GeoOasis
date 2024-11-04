export interface ToolBoxBase {
    registerTool(tool: BaseTool): void;
    getTool(name: string): BaseTool | undefined;
    runTool(toolName: string, data: any, options: any): Promise<any>;
}

// TODO: not good, support custom Tool
export interface BaseTool {
    name: string;
    execute(data: any, options?: any): Promise<any>;
}
