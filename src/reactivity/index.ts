import { createReactive } from "./create-reactive.js";
export { reactive } from "./reactive.js";
export { shallowReactive } from "./shallow-reactive.js";
export { readonly } from "./readonly.js";
export { shallowReadonly } from "./shallow-readonly.js";
export { effect } from "./effect.js";
export { watch } from "./watch.js";

export function ref(data: any) {
    return createReactive(data);
}
