import { createReactive } from "./create-reactive";

export function shallowReactive<T>(data: T) {
    return createReactive(data, {
        isShallow: true
    });
}
