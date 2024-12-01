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
import Switch from "./internals/Switch.vue";
import { ref } from "vue";
import { nanoid } from "nanoid";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import "./Dialog.css";

const store = useGeoOasisStore();
const { editor } = store;
const option = ref(false);
const input = ref("");
const ionToken = ref(""); // TODO:
const assetID = ref("");
const handleUpload = () => {
    if (option.value) {
        editor.addLayer({
            id: nanoid(),
            name: "",
            type: "3dtiles",
            url: assetID.value,
            show: true,
            ion: true
        });
    } else {
        editor.addLayer({
            id: nanoid(),
            name: "default",
            type: "3dtiles",
            url: input.value,
            show: true
        });
    }
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
                    Add 3D Tiles from url or CesiumIon
                </DialogDescription>
                <fieldset class="Fieldset">
                    <Switch
                        name="UrlOrCesiumIon"
                        :checked="option"
                        @update:checked="(checked) => (option = checked)"
                    />
                </fieldset>
                <fieldset class="Fieldset" v-if="!option">
                    <label class="Label" for="url">Url</label>
                    <input
                        id="url"
                        class="Input"
                        placeholder="please input 3D Tiles Url"
                        v-model="input"
                    />
                </fieldset>
                <!-- <fieldset class="Fieldset" v-if="option">
                    <label class="Label" for="token">CesiumIonToken</label>
                    <input
                        id="token"
                        class="Input"
                        placeholder="please input cesium Ion Token"
                        v-model="ionToken"
                    />
                </fieldset> -->
                <fieldset class="Fieldset" v-if="option">
                    <label class="Label" for="assetId">Asset ID</label>
                    <input
                        id="assetId"
                        class="Input"
                        placeholder="please input cesium Ion Token"
                        v-model="assetID"
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
