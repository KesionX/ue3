import { VNode } from "../types/vnode";

export function unmount(vnode: VNode | null) {
    if (!vnode) {
        return;
    }
    const el = vnode.el;
    const parent = el.parentNode;
    parent && parent.removeChild(el);
}