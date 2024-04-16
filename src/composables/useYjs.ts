import { onMounted, shallowRef } from "vue";
import { BindingYjs } from "../editor/bindingYjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";

export const useYjs = () => {
    const { editor } = useGeoOasisStore();
    // @ts-ignore
    const yjsBinding = shallowRef<BindingYjs>(new BindingYjs(editor));

    return { yjsBinding };
};
