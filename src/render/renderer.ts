import { VHTMLElement, RendererAdapter } from "../types";
import { hydrate } from "./hydrate";
import shouldSetAsProps from "../utils/should-set-as-props";
import normalizeClass from "../utils/normalize-class";
import { patch } from "./patch";

const defaultAdapter: RendererAdapter = {
    createElement(tag) {
        return document.createElement(tag);
    },
    setElementText(el: HTMLElement, text: string) {
        el.textContent = text;
    },
    insert(el: HTMLElement, parent: HTMLElement, anhor = null) {
        parent.insertBefore(el, anhor);
    },
    patchProps(el: HTMLElement, key: string, _prevValue: any, nextValue: any) {
        if (key === "class") {
            el.className = normalizeClass(nextValue);
        } else if (shouldSetAsProps(el, key, nextValue)) {
            const type = typeof (el as any)[key];
            if (type === "boolean" && nextValue === "") {
                (el as any)[key] = true;
            } else {
                (el as any)[key] = nextValue;
            }
        } else {
            // 如果要设置的属性值不在DOM Properties内，则使用HTML Attribute函数设置属性
            el.setAttribute(key, nextValue);
        }
    }
};

export function createRenderer(adapter: RendererAdapter) {
    function render(vnode: VNode, container: HTMLElement) {
        if (vnode) {
            patch(
                (container as VHTMLElement)._vnode,
                vnode,
                container,
                adapter
            );
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
