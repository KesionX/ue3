import { createReactive } from "./create-reactive";

export function shallowReadonly<T>(data: T) {
    return createReactive(data, {
        isShallow: true,
        readonly: true
    });
}
