import { VNode } from "./vnode";

export interface VHTMLElement extends HTMLElement {
    _vnode: VNode | null;
    _vei: Record<string, any>;
}
