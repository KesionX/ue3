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
        // 类型不同直接卸载
        unmount(oldVNode);
        oldVNode = null;
    }
    const { type } = newVNode;
    if (typeof type === "string") {
        if (!oldVNode) {
            // 挂载
            mountElement(newVNode, container, adapter);
        } else {
            // 更新
            patchElement(oldVNode, newVNode, adapter);
        }
    } else if (typeof type === "object") {
        // 组件
    } else {
        // 其他
    }
}

function patchElement(
    oldVNode: VNode,
    newVNode: VNode,
    adapter: RendererAdapter
) {
    const el = (newVNode.el = oldVNode.el);
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};

    // 更新props
    // 更新不等值
    for (const key in newProps) {
        if (oldProps[key] !== newProps[key]) {
            adapter.patchProps(el, key, oldProps[key], newProps[key]);
        }
    }
    // 更新去掉的值
    for (const key in oldProps) {
        if (!(key in newProps)) {
            adapter.patchProps(el, key, oldProps[key], null);
        }
    }
    // 更新children
    patchChildren(oldVNode, newVNode, el, adapter);
}

function patchChildren(
    oldVNode: VNode,
    newVNode: VNode,
    container: HTMLElement,
    adapter: RendererAdapter
) {
    // 没有节点、文本节点、一组节点
    if (typeof newVNode.children === "string") {
        if (oldVNode.children instanceof Array) {
            oldVNode.children.forEach(child => unmount(child));
        }
        adapter.setElementText(container, newVNode.children);
    } else if (Array.isArray(newVNode.children)) {
        if (Array.isArray(oldVNode)) {
            // 核心diff
        } else {
            adapter.setElementText(container, "");
            newVNode.children.forEach(child => {
                patch(null, child, container, adapter);
            });
        }
    } else {
        if (oldVNode.children instanceof Array) {
            oldVNode.children.forEach(child => unmount(child));
        } else if (typeof oldVNode.children === 'string') {
            adapter.setElementText(container, '');
        }
    }
}

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
                // TODO
                patch(null, child, el, adapter);
            });
    }
    adapter.insert(el, container);
    return el;
}
