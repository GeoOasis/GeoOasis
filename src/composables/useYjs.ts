import { onMounted, shallowRef } from "vue";
import { BindingYjs } from "../editor/bindingYjs";
import { useViewerStore } from "../store/viewer-store";

export const useYjs = () => {
    const { editor } = useViewerStore();
    // @ts-ignore
    const yjsBinding = shallowRef<BindingYjs>(new BindingYjs(editor));

    return { yjsBinding };
};
