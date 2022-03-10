import { createReactive } from "./create-reactive";

export function readonly<T>(data: T) {
    return createReactive(data, {
        readonly: true
    });
}
