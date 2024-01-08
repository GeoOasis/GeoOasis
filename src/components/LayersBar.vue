<script setup lang="ts">
</script>

<template>
    <div class="layersbar">
        <ul>
            <li>layer1</li>
            <li>layer2</li>
            <li>layer3</li>
        </ul>
    </div>
</template>

<style scoped>
.layersbar {
    position: fixed;
    left: 30px;
    top: 50%;
    transform: translateY(-50%);

    width: 200px;
    height: calc(100% - 300px);

    background-color: skyblue;
    box-shadow: 0 0 10px;
    border-radius: 10px;
    padding: 30px;
}
</style>