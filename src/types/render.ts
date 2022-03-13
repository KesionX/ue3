export interface RendererAdapter {
    createElement: (tag: string) => HTMLElement;
    insert: (el: HTMLElement, parent: HTMLElement, anchor?: any) => void;
    setElementText: (el: HTMLElement, text: string) => void;
}
