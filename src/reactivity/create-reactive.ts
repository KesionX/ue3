import { track, trigger } from "./effect.js";

export interface IReactiveOption {
    isShallow?: boolean;
    readonly?: boolean;
}

const originMethod = Array.prototype.includes;
const arrayInstrumentations = {
    includes: function (...args: any[]) {
        // @ts-ignore
        let res = originMethod.apply(this, args)
        if (res === false) {
            // @ts-ignore
            res = originMethod.apply((this as any)['__RAW__'], args);
        }
        return res;
    }
}

const reactiveMap = new Map();

export function createReactive<T extends Record<PropertyKey, any>>(
    data: T,
    option?: IReactiveOption,
    iterateKey?: symbol
) {

    if (reactiveMap.has(data)) {
        return reactiveMap.get(data);
    }

    const ITERATE_KEY = iterateKey || Symbol();
    const RAW = "__RAW__";
    const objProxy: any = new Proxy<T>(data, {
        get(target: T, key: PropertyKey, receiver: any) {
            // console.log('get', target, key);
            if (key === RAW) {
                return target;
            }
            if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
                return Reflect.get(arrayInstrumentations, key, receiver);
            }

            !option?.readonly && typeof key !== 'symbol' && track(target, key);

            const res = Reflect.get(target, key, receiver);
            if (option?.isShallow) {
                return res;
            }
            if (typeof res === "object" && res !== null) {
                return createReactive(res, option, ITERATE_KEY);
            }
            return res;
        },
        set(target: T, key: PropertyKey, newVal: any, receiver: any) {
            // console.log('set', target, key, option);
            if (option?.readonly) {
                console.warn(`prototype ${String(key)} is readonly.`);
                return true;
            }
            // 旧值
            const oldVal = target[key];
            const type = Array.isArray(target)
                ? Number(key) < target.length
                    ? "SET"
                    : "ADD"
                : Object.prototype.hasOwnProperty.call(target, key)
                ? "SET"
                : "ADD";
            const res = Reflect.set(target, key, newVal, receiver);
            if (
                target === receiver[RAW] && //原型链问题
                oldVal !== newVal &&
                // 比较新值与旧值，并且都不是NaN的时候才触发响应
                (oldVal === oldVal || newVal === newVal)
            ) {
                trigger(target, key, ITERATE_KEY, type, newVal);
            }
            return res;
        },
        has(target: T, key: PropertyKey) {
            track(target, key);
            return Reflect.has(target, key);
        },
        ownKeys(target: T) {
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
            return Reflect.ownKeys(target);
        },
        deleteProperty(target: T, key: PropertyKey) {
            if (option?.readonly) {
                console.warn(`prototype ${String(key)} is readonly.`);
                return true;
            }
            const hadKey = Object.prototype.hasOwnProperty.call(target, key);
            const res = Reflect.deleteProperty(target, key);
            if (res && hadKey) {
                trigger(target, key, ITERATE_KEY, "DELETE");
            }
            return res;
        }
    });
    reactiveMap.set(data, objProxy);
    return objProxy;
}