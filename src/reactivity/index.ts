import { createReactive } from "./create-reactive";
export { reactive } from "./reactive";
export { shallowReactive } from "./shallow-reactive";
export { readonly } from "./readonly";
export { shallowReadonly } from "./shallow-readonly";
export { effect } from "./effect";
export { watch } from "./watch";

export function ref(data: any) {
    return createReactive(data);
}
