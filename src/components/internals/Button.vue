<script setup lang="ts"></script>

<template>
    <button class="btn">
        <slot></slot>
    </button>
</template>

<style lang="css" scoped>
button {
    all: unset;
}

.btn {
    flex: 0 0 auto;
    color: var(--mauve-11);
    height: 25px;
    padding: 0 5px;
    border-radius: 4px;
    display: inline-flex;
    font-size: 15px;
    line-height: 1;
    align-items: center;
    justify-content: center;
}

.btn:hover {
    background-color: var(--grass-4);
    color: var(--grass-12);
}

.btn:focus {
    position: relative;
    box-shadow: 0 0 0 2px var(--grass-8);
}

.btn {
    padding-left: 10px;
    padding-right: 10px;
    color: white;
    background-color: var(--grass-9);
}

.btn:hover {
    color: white;
    background-color: var(--grass-10);
}
</style>
