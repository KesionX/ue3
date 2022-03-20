import { Fragment } from "../types";
import { VNode } from "../types/vnode";

export function unmount(vnode: VNode | null) {
    if (!vnode) {
        return;
    }
    vnode.type === Fragment &&
        (vnode.children as VNode[]).forEach(child => {
            unmount(child);
        });
    const el = vnode.el;
    const parent = el.parentNode;
    parent && parent.removeChild(el);
}
