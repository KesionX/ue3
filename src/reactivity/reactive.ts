import { getProxy } from "./get-proxy.js";

export function reactive<T>(data: T) {
    return getProxy(data);
}