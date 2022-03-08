import { createReactive } from "./create-reactive.js";

export function readonly<T>(data: T) {
    return createReactive(data, {
        readonly: true
    });
}
