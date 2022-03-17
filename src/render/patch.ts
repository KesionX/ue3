import { Fragment, RendererAdapter, VTypeText } from "../types";
import { VNode } from "../types/vnode";
import { unmount } from "./unmount";

export function patch(
    oldVNode: VNode | null,
    newVNode: VNode,
    container: HTMLElement | null,
    anchor: ChildNode | null,
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
            console.log("~~~~~~~~~~~~~~~~~~~~ 新节点",  oldVNode,newVNode);
            mountElement(newVNode, container, anchor, adapter);
        } else {
            // 更新
            patchElement(oldVNode, newVNode, adapter);
        }
    } else if (typeof type === "object") {
        // 组件
    } else if (type === VTypeText) {
        if (!oldVNode) {
            // @ts-ignore
            const el = (newVNode.el = adapter.createText(
                newVNode.children as string
            ));
            container && adapter.insert(el, container, anchor);
        } else {
            const el = (newVNode.el = oldVNode.el);
            if (newVNode.children !== oldVNode.children) {
                adapter.setText(el, newVNode.children as string);
            }
        }
    } else if (type === Fragment) {
        if (!oldVNode) {
            (newVNode.children as VNode[]).forEach(child => {
                patch(null, child, container, null, adapter);
            });
        } else {
            patchChildren(oldVNode, newVNode, container, adapter);
        }
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
    container: HTMLElement | null,
    adapter: RendererAdapter
) {
    // 没有节点、文本节点、一组节点
    if (typeof newVNode.children === "string") {
        if (oldVNode.children instanceof Array) {
            oldVNode.children.forEach(child => unmount(child))
            container && adapter.setElementText(container, newVNode.children);
        }
        if (
            (typeof oldVNode.children === "string" &&
                oldVNode.children !== newVNode.children) ||
            !newVNode.children
        ) {
            container && adapter.setElementText(container, newVNode.children);
        }
    } else if (Array.isArray(newVNode.children)) {
        if (Array.isArray(oldVNode.children)) {
            // 核心diff
            const oldChildren = oldVNode.children;
            const newChildren = newVNode.children;

            let lastIndex = 0;
            for (let i = 0; i < newChildren.length; i++) {
                const newChild = newChildren[i];
                let j = 0;
                let find = false;
                for (; j < oldChildren.length; j++) {
                    const oldChild = oldChildren[j];
                    if (oldChild.key === newChild.key) {
                        find = true;
                        patch(oldChild, newChild, container, null, adapter);
                        if (j < lastIndex) {
                            const prevVNode = newChildren[i - 1];
                            if (prevVNode) {
                                const anchor = prevVNode.el.nextSibling;
                                container && adapter.insert(newChild.el, container, anchor);
                            }
                        } else {
                            lastIndex = j;
                        }
                        break;
                    }
                }
                // 新增节点
                if (!find) {
                    const prevVNode = newChildren[i - 1];
                    let anchor = null;
                    if (prevVNode) {
                        anchor = prevVNode.el.nextSibling;
                    } else {
                        anchor = container?.firstChild;
                    }
                    !anchor && (anchor = null);
                    patch(null, newChild, container, anchor, adapter);
                }
            }

            // const oldLength = oldChildren.length;
            // const newLength = newChildren.length;
            // const commonLength = Math.min(oldLength, newLength);
            // for (let i = 0; i < commonLength; i++) {
            //     // const element = oldLength[i];
            //     patch(oldChildren[i], newChildren[i], null, adapter);
                
            // }

            // if (newLength > oldLength) {
            //     for (let i = commonLength; i < newLength; i++) {
            //         patch(null, newChildren[i], container, adapter);
            //     }
            // } else {
            //     for (let i = commonLength; i < oldLength; i++) {
            //         unmount(oldChildren[i]);
            //     }
            // }

            // for (let index = 0; index < oldChildren.length; index++) {
            //     patch(oldChildren[index], newChildren[index], null, adapter);
            // }
        } else {
            container && adapter.setElementText(container, "");
            newVNode.children.forEach(child => {
                patch(null, child, container, null, adapter);
            });
        }
    } else {
        if (oldVNode.children instanceof Array) {
            oldVNode.children.forEach(child => unmount(child));
        } else if (typeof oldVNode.children === "string") {
            container && adapter.setElementText(container, "");
        }
    }
}

function mountElement(
    vnode: VNode,
    container: HTMLElement | null,
    anchor: ChildNode | null,
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
                patch(null, child, el, null, adapter);
            });
    }
    container && adapter.insert(el, container, anchor);
    return el;
}
