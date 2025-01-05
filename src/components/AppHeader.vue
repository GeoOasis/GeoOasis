<script setup lang="ts">
import BoardBar from "./BoardBar.vue";
import ToolsBar from "./ToolsBar.vue";
import CollabBar from "./CollabBar.vue";
</script>

<template>
    <div class="header-container">
        <div class="board">
            <BoardBar />
        </div>
        <div class="tools">
            <ToolsBar />
        </div>
        <div class="collab">
            <CollabBar />
        </div>
    </div>
</template>

<style scoped>
.header-container {
    position: fixed;
    top: 30px;
    left: 30px;
    right: 30px;
    display: flex;
    gap: 20px;
    flex-direction: row;
    align-items: center;
}

.board {
    flex: 1 100px;
}

.collab {
    flex: 1 100px;
}

.tools {
    flex: 8;
}
</style>
