import { RendererAdapter } from "../types";

export function patch(
    oldVNode: VNode | null,
    newVNode: VNode,
    container: HTMLElement,
    adapter: RendererAdapter
) {
    if (!oldVNode) {
        // mount
        mountElement(newVNode, container, adapter);
    } else {
    }
}

function mountElement(
    vnode: VNode,
    container: HTMLElement,
    adapter: RendererAdapter
) {
    const el = adapter.createElement(vnode.tag as string);
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
