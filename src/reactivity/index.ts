import { getProxy } from "./get-proxy.js";
export { reactive } from "./reactive.js";
export { effect } from "./effect.js";

export function ref(data: any) {
    return getProxy(data);
}
