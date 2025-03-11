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
const isGltf = ref(false);
const isCesiumIon = ref(false);
const assetName = ref("");
const asset = ref("");
// const ionToken = ref(""); // TODO:
const handleUpload = () => {
    if (isGltf.value) {
        editor.assetLibrary.addAsset({
            name: assetName.value,
            url: asset.value,
            ion: isCesiumIon.value
        });
        console.log({
            name: assetName.value,
            url: asset.value,
            ion: isCesiumIon.value
        });
    } else {
        editor.addLayer({
            id: nanoid(),
            name: "default",
            type: "3dtiles",
            url: asset.value,
            show: true,
            ion: isCesiumIon.value
        });
    }
    assetName.value = "";
    asset.value = "";
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
                    Add 3D Tiles or Gltf Model from url or Cesium Ion
                </DialogDescription>
                <fieldset class="Fieldset">
                    <Switch
                        name="3D Tiles Or Gltf Model"
                        :checked="isGltf"
                        @update:checked="(checked) => (isGltf = checked)"
                    />
                </fieldset>
                <fieldset class="Fieldset">
                    <Switch
                        name="Url Or CesiumIon"
                        :checked="isCesiumIon"
                        @update:checked="(checked) => (isCesiumIon = checked)"
                    />
                </fieldset>
                <fieldset class="Fieldset">
                    <label class="Label" for="asset-name">Asset Name</label>
                    <input
                        id="asset-name"
                        class="Input"
                        placeholder="please input Asset Name"
                        v-model="assetName"
                    />
                </fieldset>
                <fieldset class="Fieldset">
                    <label class="Label" for="asset">
                        Asset {{ isCesiumIon ? "ID" : "Url" }}
                    </label>
                    <input
                        id="asset"
                        class="Input"
                        :placeholder="
                            isCesiumIon
                                ? 'please input cesium Ion Asset Id'
                                : 'please input Url'
                        "
                        v-model="asset"
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
