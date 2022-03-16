import { VNode } from "./vnode";

export const VTypeText = Symbol();
export const VTypeComment = Symbol();
export const Fragment = Symbol();
export interface VHTMLElement extends HTMLElement {
    _vnode: VNode | null;
    _vei: Record<string, any>;
}
