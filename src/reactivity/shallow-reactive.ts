import { createReactive } from "./create-reactive.js";

export function shallowReactive<T>(data: T) {
    return createReactive(data, {
        isShallow: true
    });
}
