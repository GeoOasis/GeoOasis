import {defineStore} from 'pinia';
import { shallowRef, ref } from 'vue';
import { Viewer } from 'cesium';

export const useViewerStore = defineStore('viewer', () => {
    const viewerRef = shallowRef<Viewer>()

    return {
        viewerRef
    }
})