import { RendererAdapter } from "../types";
import { VNode } from "../types/vnode";
import { unmount } from "./unmount";

export function patch(
    oldVNode: VNode | null,
    newVNode: VNode,
    container: HTMLElement,
    adapter: RendererAdapter
) {
    if (oldVNode && oldVNode.type !== newVNode.type) {
        unmount(oldVNode);
        oldVNode = null;
    }
    const { type } = newVNode;
    if (typeof type === "string") {
        if (!oldVNode) {
            mountElement(newVNode, container, adapter);
        } else {
            patchElement(oldVNode, newVNode);
        }
    } else if (typeof type === "object") {
    } else {
    }
}

function patchElement(oldVNode: VNode, newVNode: VNode) {}

function mountElement(
    vnode: VNode,
    container: HTMLElement,
    adapter: RendererAdapter
) {
    const el = adapter.createElement(vnode.type as string);
    vnode.el = el;
    // handle props
    if (vnode.props) {
        for (const key in vnode.props) {
            const value = vnode.props[key];
            adapter.patchProps(el, key, null, value);
        }
    }
    // handle children
    if (typeof vnode.children === "string") {
        adapter.setElementText(el, vnode.children);
    } else {
        vnode.children &&
            vnode.children.forEach(child => {
                patch(null, child, el, adapter);
            });
    }
    adapter.insert(el, container);
    return el;
}
