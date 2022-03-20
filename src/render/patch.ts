import { Fragment, RendererAdapter, VTypeText } from "../types";
import { VNode } from "../types/vnode";
import { unmount } from "./unmount";
import { getSequence } from "../utils/get-sequence";
import { mountComponent, patchComponent } from "./component";

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
            console.log("~~~~~~~~~~~~~~~~~~~~ 新节点", oldVNode, newVNode);
            mountElement(newVNode, container, anchor, adapter);
        } else {
            // 更新
            patchElement(oldVNode, newVNode, adapter);
        }
    } else if (typeof type === "object") {
        // 组件
        if (!oldVNode) {
            container && mountComponent(newVNode, container, anchor, adapter);
        } else {
            container && patchComponent(oldVNode, newVNode, container, anchor, adapter);
        }
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
            oldVNode.children.forEach(child => unmount(child));
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
            // const oldChildren = oldVNode.children;
            // const newChildren = newVNode.children;
            patchKeyedChildren(oldVNode, newVNode, container, adapter);
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

/**
 * 简单diff
 * @param oldChildren 旧节点
 * @param newChildren 新节点
 * @param container
 * @param adapter
 */
function simpleDiff(
    oldChildren: VNode[],
    newChildren: VNode[],
    container: HTMLElement | null,
    adapter: RendererAdapter
) {
    let lastIndex = 0;
    for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        let j = 0;
        let find = false;
        for (; j < oldChildren.length; j++) {
            const oldChild = oldChildren[j];
            if (oldChild.key === newChild.key) {
                find = true;
                // 更新节点
                patch(oldChild, newChild, container, null, adapter);
                if (j < lastIndex) {
                    // 移动节点
                    const prevVNode = newChildren[i - 1];
                    if (prevVNode) {
                        const anchor = prevVNode.el.nextSibling;
                        container &&
                            adapter.insert(newChild.el, container, anchor);
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
                container && (anchor = container.firstChild);
            }
            !anchor && (anchor = null);
            patch(null, newChild, container, anchor, adapter);
        }
        // 移除节点
        for (let index = 0; index < oldChildren.length; index++) {
            const element = oldChildren[index];
            const has = newChildren.find(({ key }) => element.key === key);
            if (!has) {
                unmount(element);
            }
        }
    }
}

/**
 * 双端diff
 * @param oldVNode 旧节点
 * @param newVNode 新节点
 * @param container
 * @param adapter
 */
function doubleEndedDiff(
    oldVNode: VNode,
    newVNode: VNode,
    container: HTMLElement | null,
    adapter: RendererAdapter
) {
    const oldChildren = oldVNode.children as Array<VNode | undefined>;
    const newChildren = newVNode.children as Array<VNode>;

    let oldStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newStartIndex = 0;
    let newEndIndex = newChildren.length - 1;

    let oldStartVNode = oldChildren[oldStartIndex];
    let oldEndVNode = oldChildren[oldEndIndex];
    let newStartVNode = newChildren[newStartIndex];
    let newEndVNode = newChildren[newEndIndex];

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (!oldStartVNode) {
            oldStartVNode = oldChildren[++oldStartIndex];
        } else if (!oldEndVNode) {
            oldEndVNode = oldChildren[--oldEndIndex];
        } else if (oldStartVNode.key === newStartVNode.key) {
            patch(oldStartVNode, newStartVNode, container, null, adapter);
            oldStartVNode = oldChildren[++oldStartIndex];
            newStartVNode = newChildren[++newStartIndex];
        } else if (oldEndVNode.key === newEndVNode.key) {
            patch(oldEndVNode, newEndVNode, container, null, adapter);
            oldEndVNode = oldChildren[--oldEndIndex];
            newEndVNode = newChildren[--newEndIndex];
        } else if (oldStartVNode.key === newEndVNode.key) {
            patch(oldStartVNode, newEndVNode, container, null, adapter);
            container &&
                adapter.insert(
                    oldStartVNode.el,
                    container,
                    oldEndVNode.el.nextSibling
                );
            oldStartVNode = oldChildren[++oldStartIndex];
            newEndVNode = newChildren[--newEndIndex];
        } else if (oldEndVNode.key === newStartVNode.key) {
            patch(oldEndVNode, newEndVNode, container, null, adapter);
            container &&
                adapter.insert(oldEndVNode.el, container, oldStartVNode.el);
            oldEndVNode = oldChildren[--oldEndIndex];
            newStartVNode = newChildren[++newStartIndex];
        } else {
            const idxInOld = oldChildren.findIndex(element => {
                if (element) {
                    return element.key === newStartVNode.key;
                }
                return false;
            });

            if (idxInOld) {
                const idxInOldVNode = oldChildren[idxInOld] as VNode;
                patch(idxInOldVNode, newStartVNode, container, null, adapter);
                container &&
                    adapter.insert(
                        idxInOldVNode.el,
                        container,
                        oldStartVNode.el
                    );
                oldChildren[idxInOld] = undefined;
            } else {
                patch(
                    null,
                    newStartVNode,
                    container,
                    oldStartVNode.el,
                    adapter
                );
            }
            newStartVNode = newChildren[++newStartIndex];
        }
    }

    if (oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex) {
        for (let index = newStartIndex; index <= newEndIndex; index++) {
            const element = newChildren[index];
            patch(
                null,
                element,
                container,
                oldStartVNode ? (oldStartVNode as VNode).el : null,
                adapter
            );
        }
    } else if (newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex) {
        for (let index = oldStartIndex; index <= oldEndIndex; index++) {
            const element = oldChildren[index];
            unmount(element as VNode);
        }
    }
}

/**
 * 快速diff
 * @param oldVNode 旧节点
 * @param newVNode 新节点
 * @param container
 * @param adapter
 */
function patchKeyedChildren(
    oldVNode: VNode,
    newVNode: VNode,
    container: HTMLElement | null,
    adapter: RendererAdapter
) {
    const oldChildren = oldVNode.children as Array<VNode>;
    const newChildren = newVNode.children as Array<VNode>;

    let j = 0;
    let oldChild = oldChildren[j];
    let newChild = newChildren[j];
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;
    let oldEndVNode = oldChildren[oldEndIndex];
    let newEndVNode = newChildren[newEndIndex];

    while (oldChild && newChild && oldChild.key === newChild.key) {
        patch(oldChild, newChild, container, null, adapter);
        oldChild = oldChildren[++j];
        newChild = newChildren[j];
    }

    // j < oldEndIndex
    while (
        j < oldEndIndex &&
        oldEndVNode &&
        newEndVNode &&
        oldEndVNode.key === newEndVNode.key
    ) {
        patch(oldEndVNode, newEndVNode, container, null, adapter);
        oldEndVNode = oldChildren[--oldEndIndex];
        newEndVNode = newChildren[--newEndIndex];
    }

    if (j > oldEndIndex && j <= newEndIndex) {
        const anchorIndex = newEndIndex + 1;
        const anchor =
            anchorIndex < newChildren.length
                ? newChildren[anchorIndex].el
                : null;
        while (j <= newEndIndex) {
            const newcc = newChildren[j++];
            patch(null, newcc, container, anchor, adapter);
        }
    } else if (j > newEndIndex && j <= oldEndIndex) {
        while (j <= oldEndIndex) {
            unmount(oldChildren[j++]);
        }
    } else {
        const count = newEndIndex - j + 1;
        const source = new Array(count);
        source.fill(-1);
        const oldStartIndex = j;
        const newStartIndex = j;

        let moved = false;
        let pos = 0;
        let patched = 0;
        const keyIndex = new Map();
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            const key = newChildren[i].key;
            if (key) {
                keyIndex.set(key, i);
            }
        }
        console.log("@@@@@@@@@@@", keyIndex, oldStartIndex, oldEndIndex, count);
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            const oldVn = oldChildren[i];
            console.log("ooooooo", oldVn);
            if (!oldVn.key) {
                continue;
            }
            if (patched <= count) {
                if (keyIndex.has(oldVn.key)) {
                    const k = keyIndex.get(oldVn.key);
                    patch(oldVn, newChildren[k], container, null, adapter);
                    source[k - newStartIndex] = i;
                    patched++;
                    if (k < pos) {
                        moved = true;
                    } else {
                        pos = k;
                    }
                } else {
                    // 卸载没有的节点
                    unmount(oldVn);
                }
            } else {
                // 卸载多余节点
                unmount(oldVn);
            }
        }
        console.log("#### source", source, moved);
        if (moved) {
            const seq = getSequence(source);
            let s = seq.length - 1;
            let i = count - 1;
            for (i; i >= 0; i--) {
                if (source[i] === -1) {
                    // 新增
                    const pos = i + newStartIndex;
                    const newVn = newChildren[pos];
                    const nextIndex = pos + 1;
                    const anchor =
                        nextIndex < newChildren.length
                            ? newChildren[nextIndex].el
                            : null;
                    patch(null, newVn, container, anchor, adapter);
                } else if (seq[s] !== i) {
                    // 需要移动
                    const pos = i + newStartIndex;
                    const newVn = newChildren[pos];
                    const nextIndex = pos + 1;
                    const anchor =
                        nextIndex < newChildren.length
                            ? newChildren[nextIndex].el
                            : null;
                    container && adapter.insert(newVn.el, container, anchor);
                } else {
                    // 不需要移动
                    s--;
                }
            }
        } else {
            for (let index = 0; index < source.length; index++) {
                const newIdx = source[index];
                if (newIdx !== -1) {
                    continue;
                }
                const pos = index + newStartIndex;
                const newVn = newChildren[pos];
                const nextIndex = pos + 1;
                const anchor =
                    nextIndex < newChildren.length
                        ? newChildren[nextIndex].el
                        : null;
                patch(null, newVn, container, anchor, adapter);
            }
        }
    }
}
