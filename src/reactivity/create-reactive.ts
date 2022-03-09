import { track, trigger, TriggerType, TriggrtFunction } from "./effect.js";

export interface IReactiveOption {
    isShallow?: boolean;
    readonly?: boolean;
}

const RAW = "__RAW__";

// 重写 'includes', 'indexOf', 'lastIndexOf'
const arrayInstrumentations: Record<string, any> = {};
["includes", "indexOf", "lastIndexOf"].forEach((method: string) => {
    const originMethod = (Array.prototype as any)[method];
    arrayInstrumentations[method] = function(...args: any[]) {
        // 代理对象查找
        let res = originMethod.apply(this, args);
        if (res === false) {
            // 原生查找
            res = originMethod.apply((this as any)[RAW], args);
        }
        return res;
    };
});
// 重写 "push", "pop", "shift", "unshift", "splice"
let shouldTrack = true;
["push", "pop", "shift", "unshift", "splice"].forEach((method: string) => {
    const originMethod = (Array.prototype as any)[method];
    arrayInstrumentations[method] = function(...args: any[]) {
        shouldTrack = false;
        const res = originMethod.apply(this, args);
        shouldTrack = true;
        return res;
    };
});

// 防止生成多个新的代理
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
    const objProxy: any = new Proxy<T>(data, {
        get(target: T, key: PropertyKey, receiver: any) {
            console.log('get', target, key);
            if (key === RAW) {
                return target;
            }

            if (
                (target instanceof Set || target instanceof Map) &&
                key === "size"
            ) {
                trackEnable(key, shouldTrack, option) &&
                    track(target, ITERATE_KEY);
                return Reflect.get(target, key, target);
            }

            // || target instanceof Map
            if (
                (target instanceof Set) &&
                (key === "delete" || key === 'add')
            ) {
                // const res = target[key].bind(target);
                // const keyUpCase = key.toLocaleUpperCase();
                // trigger(target, key, ITERATE_KEY, keyUpCase as TriggerType)
                // setTimeout(() => {
                //     const keyUpCase = key.toLocaleUpperCase();
                // trigger(target, key, ITERATE_KEY, keyUpCase as TriggerType)
                // });
                // const setInstrumentations = {
                //     add(key: any) {
                //         const originTarget = (this as any)[RAW];
                //         const res = originTarget.add(key);
                //         trigger(target, key, ITERATE_KEY, 'ADD');
                //         return res; 
                //     }
                // }                 
                // let res;
                if (key === 'add') {
                    // res = target.add(key);
                    // const res = setInstrumentations.add;
                    // trigger(target, key, ITERATE_KEY, 'ADD');
                    console.log('++++++++++ add');
                    return getSetInstrumentations(target, ITERATE_KEY);
                }

                return target[key].bind(target);
            }

            if (
                Array.isArray(target) &&
                arrayInstrumentations.hasOwnProperty(key)
            ) {
                return Reflect.get(arrayInstrumentations, key, receiver);
            }

            trackEnable(key, shouldTrack, option) && track(target, key);

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
            trackEnable(key, shouldTrack, option) && track(target, key);
            return Reflect.has(target, key);
        },
        ownKeys(target: T) {
            shouldTrack &&
                track(target, Array.isArray(target) ? "length" : ITERATE_KEY);
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

function getSetInstrumentations(target: any, ITERATE_KEY: symbol) {
    const setInstrumentations = {
        add(key: any) {
            const originTarget = (this as any)[RAW];
            const res = originTarget.add(key);
            trigger(target, key, ITERATE_KEY, 'ADD');
            return res; 
        }
    }

    return setInstrumentations.add;
}

function trackEnable(
    key: PropertyKey,
    shouldTrack: boolean,
    options?: IReactiveOption
) {
    return !options?.readonly && typeof key !== "symbol" && shouldTrack;
}
