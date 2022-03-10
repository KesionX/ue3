import { createReactive } from "./create-reactive";

export function reactive<T>(data: T) {
    return createReactive(data);
}