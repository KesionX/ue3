export function render(vnode: VNode, container: HTMLElement): HTMLElement {
    if (typeof vnode.tag === "string" || vnode.tag instanceof HTMLElement) {
        return mountElement(vnode, container);
    } else {
        return mountComponent(vnode, container);
    }
}

function mountElement(vnode: VNode, container: HTMLElement) {
    let el = vnode.tag;
    if (!(el instanceof HTMLElement)) {
        el = document.createElement(vnode.tag as string);
    }

    // handle props
    for (const key in vnode.props) {
        // emit
        if (/^on/.test(key)) {
            continue;
        }
        const attrValue = vnode.props[key];
        // juest attrvalue string
        if (typeof attrValue === "string") {
            el.setAttribute(key, attrValue);
        }
        // TODO
    }
    // handle children
    if (typeof vnode.children === "string") {
        el.innerText = vnode.children;
    } else {
        vnode.children &&
            vnode.children.forEach(child => {
                (el as HTMLElement).appendChild(
                    render(child, el as HTMLElement)
                );
            });
    }

    container.appendChild(el);
    return el;
}

function mountComponent(vnode: VNode, container: HTMLElement) {
    const subtree = (vnode.tag as ComponentFunction)();
    return render(subtree, container);
}