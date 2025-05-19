import { defineStore } from "pinia";

export const useLogStore = defineStore("log", {
    state: () => ({
        logs: [
            // 示例日志，可删除
            { time: "12:00:01", message: "应用已启动", type: "info" },
            // { time: "12:00:02", message: "加载数据成功", type: "success" },
            // { time: "12:00:03", message: "警告：数据格式不规范", type: "warn" },
            // { time: "12:00:04", message: "错误：无法连接服务器", type: "error" }
        ]
    }),
    actions: {
        addLog(message: string, type = "info") {
            const now = new Date();
            const time = now.toLocaleTimeString();
            this.logs.push({ time, message, type });
        },
        clearLogs() {
            this.logs = [];
        }
    }
});
