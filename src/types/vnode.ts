declare type PropConstructor<T> =
    | {
          new (...args: any[]): T & object;
      }
    | {
          (): T;
      }
    | {
          new (...args: string[]): Function;
      };

declare type DefaultFactory<T> = () => T | null | undefined;

declare type PropType<T> = PropConstructor<T> | PropConstructor<T>[];

export interface PropOptions<T = any, D = T> {
    type?: PropType<T> | true | null;
    required?: boolean;
    default?: D | DefaultFactory<D> | null | undefined | object;
    validator?(value: unknown): boolean;
}

declare type Prop<T, D = T> = PropOptions<T, D> | PropType<T>;

declare type Data = {
    [key: string]: unknown;
};

declare type ComponentObjectPropsOptions<P = Data> = {
    [K in keyof P]: Prop<P[K]> | null;
};
// string[]
export type ComponentPropsOptions<P = Data> = ComponentObjectPropsOptions<P>;
export type ComponentFunction<Props = ComponentPropsOptions> = () => VNode;

export const enum LifecycleHooks {
  BEFORE_CREATE = 'beforeCreated',
  CREATED = 'created',
  BEFORE_MOUNT = 'beforeMount',
  MOUNTED = 'mounted',
  BEFORE_UPDATE = 'beforeUpdate',
  UPDATED = 'updated',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
  DEACTIVATED = 'da',
  ACTIVATED = 'a',
  RENDER_TRIGGERED = 'rtg',
  RENDER_TRACKED = 'rtc',
  ERROR_CAPTURED = 'ec',
  SERVER_PREFETCH = 'sp'
}

export interface SetupContext {
    emit: (event: string, ...args: any) => void;
    attrs: Data;
}

export type SetupFunction<P, C> = (props: P, context: C) => ComponentFunction | VNode;

export interface ComponentOptions {
    // el
    props: ComponentPropsOptions;
    data: () => Data;
    render: ComponentFunction;
    setup: SetupFunction<ComponentPropsOptions, SetupContext>;
    [LifecycleHooks.BEFORE_CREATE]?: () => void;
    [LifecycleHooks.CREATED]?: <T>(data: T) => void;
    [LifecycleHooks.BEFORE_MOUNT]?: <T>(data: T) => void;
    [LifecycleHooks.MOUNTED]?: <T>(data: T) => void;
    [LifecycleHooks.BEFORE_UPDATE]?: <T>(data: T) => void;
    [LifecycleHooks.UPDATED]?: <T>(data: T) => void;
}

export interface ComponentInstance {
    state: Data; // data
    props: ComponentPropsOptions,
    isMounted: boolean;
    subTree: VNode | null;
    mounted: Array<ComponentFunction>;
}

declare type VueTag = string | ComponentFunction | symbol | ComponentOptions;

export type VNodeTypes = string;
//   | VNode
//   | Component
//   | typeof Text
//   | typeof Static
//   | typeof Comment
//   | typeof Fragment
//   | typeof TeleportImpl
//   | typeof SuspenseImpl

export interface RendererNode {
    [key: string]: any;
}

export interface RendererElement extends RendererNode {}

export interface VNode<Props = ComponentPropsOptions> {
    el: HTMLElement;
    type: VueTag;
    props?: Props;
    data?: Props;
    key?: string | number | symbol;
    children?: VNode[] | string;
    component?: ComponentInstance;
}
