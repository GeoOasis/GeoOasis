<script setup lang="ts">
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger
} from "radix-vue";
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { nanoid } from "nanoid";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import "./Dialog.css";

const store = useGeoOasisStore();
const { editor } = store;
const input = ref("");
const handleUpload = () => {
    editor.addLayer({
        id: nanoid(),
        name: "test 3dTiles",
        type: "3dtiles",
        url: input.value,
        show: true
    });
};
</script>

<template>
    <DialogRoot>
        <DialogTrigger class="btn" style="margin-left: 10px">
            <slot name="trigger"></slot>
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay class="DialogOverlay" />
            <DialogContent class="DialogContent">
                <DialogTitle class="DialogTitle">Upload from Url</DialogTitle>
                <DialogDescription class="DialogDescription">
                    从Url上传3d tiles
                </DialogDescription>
                <fieldset class="Fieldset">
                    <label class="Label" for="url">Url</label>
                    <input
                        id="url"
                        class="Input"
                        placeholder="please input 3D Tiles Url"
                        v-model="input"
                    />
                </fieldset>
                <div
                    :style="{
                        display: 'flex',
                        marginTop: 25,
                        justifyContent: 'flex-end'
                    }"
                >
                    <DialogClose as-child>
                        <button class="Button green" @click="handleUpload">
                            Add to map
                        </button>
                    </DialogClose>
                </div>
                <DialogClose class="IconButton" aria-label="Close">
                    <Icon icon="lucide:x" />
                </DialogClose>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style scoped></style>
