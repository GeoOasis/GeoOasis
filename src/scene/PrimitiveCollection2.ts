import { AssociativeArray, destroyObject } from "cesium";

export class PrimitiveCollection2 {
    private primitives: AssociativeArray; // Array<Primitive>
    public show: boolean;
    public destroyPrimitives: boolean;

    constructor() {
        this.primitives = new AssociativeArray();
        this.show = true;
        this.destroyPrimitives = true;
    }

    add(primitive: any) {
        const id = primitive.id;
        if (this.primitives.contains(id)) {
            return;
        }
        this.primitives.set(id, primitive);
    }

    remove(primitive: any) {
        return this.removeById(primitive.id);
    }

    removeById(id: string) {
        const primitive = this.getById(id);
        if (this.destroyPrimitives) {
            primitive.destroy();
        }
        this.primitives.remove(id);
    }

    removeAll() {
        const length = this.primitives.length;
        for (let i = 0; i < length; i++) {
            if (this.destroyPrimitives) {
                this.primitives.values[i].destroy();
            }
        }
        this.primitives.removeAll();
    }

    getById(id: string) {
        return this.primitives.get(id);
    }

    update(frameState: any) {
        if (!this.show) {
            return;
        }

        for (const primitive of this.primitives.values) {
            primitive.update(frameState);
        }
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        this.removeAll();
        return destroyObject(this);
    }
}
