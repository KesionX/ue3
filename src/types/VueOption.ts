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

interface PropOptions<T = any, D = T> {
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
declare type ComponentPropsOptions<P = Data> = ComponentObjectPropsOptions<P>;

interface ComponentOptionsBase {
    // el
    props: ComponentPropsOptions;
    // data
    // render
    // setup?: SetupFunction<Props, RawBindings, Emits>;
}

declare type ComponentFunction<Props = ComponentPropsOptions> = () => VNode;
declare type VueTag = HTMLElement | string | ComponentFunction;

declare type VNode<Props = ComponentPropsOptions> = {
    tag: VueTag;
    props?: Props;
    data?: Props;
    children?: VNode[];
};
