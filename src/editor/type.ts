import { Element } from "../element/element";

interface ElementMutatedEventDetail {
    id: string;
    update: Record<string, any>;
    local: boolean;
}

export type ElementMuatedEvent = CustomEvent<ElementMutatedEventDetail>;

interface ElementAddedEventDetail {
    element: Element;
    local: boolean;
}

export type ElementAddedEvent = CustomEvent<ElementAddedEventDetail>;
