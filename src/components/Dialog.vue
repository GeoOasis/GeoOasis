<script setup lang="ts">
import { ref } from "vue";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { storeToRefs } from "pinia";

const store = useGeoOasisStore();
const { dialogVisible } = storeToRefs(store)
const { editor } = store;
const input = ref('')
const handleUpload = () => {
    dialogVisible.value = false;
    editor.addLayer({
        id: "for test use",
        name: "3dTiles",
        type: "3dtiles",
        url: input.value,
        show: true
    });
}
</script>

<template>
    <el-dialog v-model="dialogVisible" title="Upload from Url" width="30%" align-center :show-close="false">
        <el-space fill direction="vertical" style="width: 100%">
            <span>从Url上传3d tiles</span>
            <el-input v-model="input" placeholder="please input 3D Tiles Url" />
        </el-space>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button @click="handleUpload">
                    Add to map
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped></style>