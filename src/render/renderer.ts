import { VHTMLElement, RendererAdapter } from "../types";
import { hydrate } from "./hydrate";
import shouldSetAsProps from "../utils/should-set-as-props";
import normalizeClass from "../utils/normalize-class";
import { patch } from "./patch";
import { VNode } from "../types/vnode";
import { unmount } from "./unmount";

const defaultAdapter: RendererAdapter = {
    createElement(tag) {
        return document.createElement(tag);
    },
    setElementText(el: HTMLElement, text: string) {
        el.textContent = text;
    },
    insert(el: HTMLElement | Text, parent: HTMLElement, anhor = null) {
        parent.insertBefore(el, anhor);
    },
    patchProps(el: HTMLElement, key: string, _prevValue: any, nextValue: any) {
        if (/^on/.test(key)) {
            const name = key.slice(2).toLowerCase();
            const invokers: any =
                (el as VHTMLElement)._vei || ((el as VHTMLElement)._vei = {});
            let invoker = invokers[key];
            if (nextValue) {
                if (!invoker) {
                    invoker = (el as VHTMLElement)._vei[key] = (e: Event) => {
                        if (e.timeStamp < invoker.attached) {
                            return;
                        }
                        // 可能是数组事件
                        if (invoker.value instanceof Array) {
                            invoker.value.forEach((fn: any) => {
                                fn && fn(e);
                            });
                        } else {
                            invoker.value(e);
                        }
                    };
                    invoker.value = nextValue;
                    invoker.attached = performance.now();
                    el.addEventListener(name, invoker);
                } else {
                    invoker.value = nextValue;
                }
            } else if (invoker) {
                el.removeEventListener(name, invoker);
            }
        } else if (key === "class") {
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
    },
    createText(text: string) {
        return document.createTextNode(text);
    },
    setText(el: HTMLElement, text: string) {
        el.nodeValue = text;
    }
};

export function createRenderer(adapter: RendererAdapter = defaultAdapter) {
    function render(vnode: VNode | null, container: HTMLElement) {
        if (vnode) {
            console.log('createRenderer', (container as VHTMLElement)._vnode, vnode);
            patch(
                (container as VHTMLElement)._vnode,
                vnode,
                container,
                adapter
            );
        } else {
            if ((container as VHTMLElement)._vnode) {
                // 相当于unmount
                unmount((container as VHTMLElement)._vnode);
            }
        }
        (container as VHTMLElement)._vnode = vnode;
    }

    return {
        render,
        hydrate
    };
}
