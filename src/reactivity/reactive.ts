import { createReactive } from "./create-reactive.js";

export function reactive<T>(data: T) {
    return createReactive(data);
}