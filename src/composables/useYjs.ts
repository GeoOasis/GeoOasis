import { onMounted, shallowRef, watch } from "vue";
import { BindingYjs } from "../editor/bindingYjs";
import { useGeoOasisStore } from "../store/GeoOasis.store";
import { storeToRefs } from "pinia";

export const useYjs = () => {
    const store = useGeoOasisStore();
    const { selectedBaseLayer } = storeToRefs(store);
    const { editor } = store;
    // @ts-ignore
    const yjsBinding = shallowRef<BindingYjs>(new BindingYjs(editor));

    onMounted(() => {
        yjsBinding.value.sharedAppStateMap.observe((event, transaction) => {
            if (!transaction.local) {
                console.log("remote transaction is received");
                event.changes.keys.forEach((change, key) => {
                    if (change.action === "update") {
                        selectedBaseLayer.value =
                            yjsBinding.value.sharedAppStateMap.get(key);
                    }
                });
            }
        });
    });

    watch(
        selectedBaseLayer,
        () => {
            yjsBinding.value.sharedAppStateMap.set(
                "selectedBaseLayer",
                selectedBaseLayer.value
            );
        },
        { immediate: true }
    );

    const undo = () => {
        yjsBinding.value.undoManager.undo();
    };

    const redo = () => {
        yjsBinding.value.undoManager.redo();
    };

    return { yjsBinding, undo, redo };
};
