import { track, trigger } from "./effect.js";

export function getProxy<T extends Record<PropertyKey, any>>(data: T) {
    const ITERATE_KEY = Symbol();
    const RAW = "__RAW__";
    const objProxy = new Proxy<T>(data, {
        get(target: T, key: PropertyKey, receiver: any) {
            if (key === RAW) {
                return target;
            }
            track(target, key);
            return Reflect.get(target, key, receiver);
        },
        set(target: T, key: PropertyKey, newVal: any, receiver: any) {
            // 旧值
            const oldVal = target[key];
            const type = Object.prototype.hasOwnProperty.call(target, key)
                ? "SET"
                : "ADD";
            const res = Reflect.set(target, key, newVal, receiver);
            if (
                target === receiver[RAW] && //原型链问题
                oldVal !== newVal &&
                // 比较新值与旧值，并且都不是NaN的时候才触发响应
                (oldVal === oldVal || newVal === newVal)
            ) {
                trigger(target, key, ITERATE_KEY, type);
            }
            return res;
        },
        has(target: T, key: PropertyKey) {
            track(target, key);
            return Reflect.has(target, key);
        },
        ownKeys(target: T) {
            track(target, ITERATE_KEY);
            return Reflect.ownKeys(target);
        },
        deleteProperty(target: T, key: PropertyKey) {
            const hadKey = Object.prototype.hasOwnProperty.call(target, key);
            const res = Reflect.deleteProperty(target, key);
            if (res && hadKey) {
                trigger(target, key, ITERATE_KEY, "DELETE");
            }
            return res;
        }
    });

    return objProxy;
}
