import {
    ComponentInstance,
    ComponentPropsOptions,
    SetupContext,
    VNode,
    ComponentOptions,
    ComponentFunction
} from "../types/vnode";
import { patch } from "./patch";
import { RendererAdapter } from "../types/render";
import {
    reactive,
    effect,
    shallowReactive,
    shallowReadonly
} from "../reactivity";
import { queueTask } from "../utils/scheduler-queue";

let currentInstance: ComponentInstance | null = null;
function setCurrentInstance(instance: ComponentInstance | null) {
    currentInstance = instance;
}

export function mountComponent(
    vnode: VNode,
    containrt: HTMLElement,
    anchor: any,
    adapter: RendererAdapter
) {
    const componentOptions = vnode.type as ComponentOptions;
    let render = componentOptions.render;
    const {
        data,
        props: propsData,
        setup,
        beforeCreated,
        created,
        beforeMount,
        mounted,
        beforeUpdate,
        updated
    } = componentOptions;
    beforeCreated && beforeCreated();
    const [props, attrs] = resolveProps(propsData, vnode.props);
    const state = reactive(data ? data() : {});
    const instance: ComponentInstance = {
        props: shallowReactive(props),
        state,
        isMounted: false,
        subTree: null,
        mounted: []
    };

    let setupState: any = null;
    const emit = (event: string, ...args: any) => {
        if (!event.length) {
            return;
        }
        const eventName = `on${event[0].toUpperCase + event.slice(1)}`;
        const handle: Function = props[eventName];
        if (handle) {
            handle(...args);
        } else {
            console.warn("not find event:", eventName);
        }
    };
    const setupContext: SetupContext = { attrs, emit };
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(props), setupContext);
    setCurrentInstance(null);
    if (typeof setupResult === "function") {
        render = setupResult;
    } else {
        setupState = setupResult;
    }

    vnode.component = instance;
    const renderContext = new Proxy(instance, {
        get(target, key, reactive) {
            const { state, props } = target;
            if (state && key in state) {
                return state[key as string];
            } else if (props && key in props) {
                return props[key as string];
            } else if (setupState && key in setupState) {
                return setupState[key];
            } else {
                console.warn("not find key:", key);
            }
        },
        set(target, key, val, reactive) {
            const { state, props } = target;
            if (state && key in state) {
                state[key as string] = val;
                return true;
            } else if (props && key in props) {
                props[key as string] = val;
                return true;
            } else if (setupState && key in setupState) {
                setupState[key] = val;
                return true;
            } else {
                console.warn("not find key:", key);
                return false;
            }
        }
    });

    // @ts-ignore
    created && created.call(renderContext);
    /**
     * 调用render 函数是，将this设置为state
     * 从而render 函数内部的this则指向state，访问自身的状态数据
     */
    effect(
        () => {
            // @ts-ignore
            const subTree = render.call(renderContext, renderContext);
            if (!instance.isMounted) {
                // @ts-ignore
                beforeMount && beforeMount.call(renderContext);
                instance.isMounted = true;
                patch(null, subTree, containrt, anchor, adapter);
                // @ts-ignore
                instance.mounted.forEach(mounted => {
                    mounted && mounted.call(renderContext);
                });
            } else {
                // @ts-ignore
                beforeUpdate && beforeUpdate.call(renderContext);
                patch(instance.subTree, subTree, containrt, anchor, adapter);
                // @ts-ignore
                updated && updated.call(renderContext);
            }
            instance.subTree = subTree;
        },
        {
            scheduler: queueTask
        }
    );
}

export function patchComponent(
    oldVNode: VNode,
    newVNode: VNode,
    containrt: HTMLElement,
    anchor: any,
    adapter: RendererAdapter
) {
    const instance = (newVNode.component = oldVNode.component);
    if (!instance) {
        return;
    }
    const { props } = instance;
    if (hasPropsChanged(oldVNode.props, newVNode.props)) {
        const [nextProps] = resolveProps(
            (newVNode.type as ComponentOptions).props,
            newVNode.props
        );

        for (const key in nextProps) {
            if (key in props) {
                props[key] = nextProps[key];
            }
        }

        for (const key in props) {
            if (!(key in nextProps)) {
                delete props[key];
            }
        }
    }
}

function hasPropsChanged(
    prevProps: ComponentPropsOptions | undefined,
    nextProps: ComponentPropsOptions | undefined
) {
    if (!prevProps && nextProps && Object.keys(nextProps).length) {
        return true;
    }
    if (!nextProps && prevProps && Object.keys(prevProps).length) {
        return true;
    }
    if (!prevProps && !nextProps) {
        return false;
    }

    if (nextProps && prevProps) {
        const nextKeys = Object.keys(nextProps);
        if (nextKeys.length !== Object.keys(prevProps).length) {
            return true;
        }
        for (let index = 0; index < nextKeys.length; index++) {
            const key = nextKeys[index];
            if (prevProps[key] !== prevProps[key]) return true;
        }
    }
    return false;
}

function resolveProps(
    options: Record<string, any> | undefined,
    propsData: Record<string, any> | undefined
) {
    const props: Record<string, any> = {};
    const attrs: Record<string, any> = {};
    for (const key in propsData) {
        if (options && key in options || key.startsWith("on")) {
            props[key] = propsData[key];
        } else {
            attrs[key] = propsData[key];
        }
    }
    return [props, attrs];
}

export function onMounted(fn: ComponentFunction) {
    if (!currentInstance) {
        console.warn("onMounted only use in setup");
        return;
    }
    currentInstance.mounted.push(fn);
}
