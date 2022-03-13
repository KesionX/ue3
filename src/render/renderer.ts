import { VHTMLElement, RendererAdapter } from "../types";
import { hydrate } from "./hydrate";

export function createRenderer(adapter: RendererAdapter) {
    function render(vnode: VNode, container: HTMLElement) {
        if (vnode) {
        } else {
            if ((container as VHTMLElement)._vnode) {
                // 相当于unmount
                container.innerHTML = "";
            }
        }
        (container as VHTMLElement)._vnode = vnode;
    }

    return {
        render,
        hydrate
    };
}
