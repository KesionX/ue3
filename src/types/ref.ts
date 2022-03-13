// declare const _refBrand: unique symbol;
export interface Ref<T> {
    value: T;
}

export declare type ToRef<T> = T extends Ref<any> ? T : Ref<T>

export declare type ToRefs<T = any> = {
    [K in keyof T]: ToRef<T[K]>;
};
