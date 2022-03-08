import { createReactive } from "./create-reactive.js";

export function shallowReadonly<T>(data: T) {
    return createReactive(data, {
        isShallow: true,
        readonly: true
    });
}
