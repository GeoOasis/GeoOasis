<template>
  <div class="result-panel">
    <div class="panel-header">
      <span>日志面板</span>
      <button @click="logStore.addLog('测试日志', 'info')">添加日志</button>
      <button @click="logStore.clearLogs()">清空</button>
    </div>
    <div class="panel-body" ref="logContainer">
      <div
        v-for="(log, index) in logStore.logs"
        :key="index"
        :class="['log-entry', log.type]"
      >
        <span class="log-time">[{{ log.time }}]</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useLogStore } from '../store/Log.store'

const logStore = useLogStore()

// 自动滚动到底部
const logContainer = ref<HTMLDivElement | null>(null)
watch(
  () => logStore.logs.length,
  () => {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  }
)

</script>

<style scoped>
.result-panel {
  position: fixed;
  bottom: 80px;
  right: 30px;
  width: 400px;
  max-height: 300px;
  border: 1px solid #ccc;
  background: #181818;
  color: #eee;
  font-family: 'Consolas', 'Menlo', monospace;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background: #232323;
  padding: 6px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  border-bottom: 1px solid #333;
}
.panel-header button {
  background: #444;
  color: #fff;
  border: none;
  padding: 2px 10px;
  border-radius: 3px;
  cursor: pointer;
}
.panel-header button:hover {
  background: #666;
}
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}
.log-entry {
  margin-bottom: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
.log-entry.info { color: #b3e5fc; }
.log-entry.success { color: #a5d6a7; }
.log-entry.warn { color: #ffe082; }
.log-entry.error { color: #ef9a9a; }
.log-time {
  color: #888;
  margin-right: 8px;
}
</style>