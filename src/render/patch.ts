import { VHTMLElement, RendererAdapter } from "../types";

export function patch(
    oldVNode: VNode,
    newVNode: VNode,
    container: VHTMLElement,
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
    container: VHTMLElement,
    adapter: RendererAdapter
) {
    // const le = document.createElement(vnode.tag);
    const el = adapter.createElement(vnode.tag as string);

    // handle children
    if (typeof vnode.children === "string") {
        // el.innerText = vnode.children;
        adapter.setElementText(el, vnode.children);
    } else {
        // vnode.children &&
        //     vnode.children.forEach(child => {
        //         (el as HTMLElement).appendChild(
        //             render(child, el as HTMLElement)
        //         );
        //     });
    }

    // container.appendChild(el);
    adapter.insert(el, container);
    return el;
}
