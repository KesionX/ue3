import { track, trigger } from "./effect";

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
    console.log('has map pre', data);
    if (reactiveMap.has(data)) {
        console.log('has map', data);
        return reactiveMap.get(data);
    }
    const ITERATE_KEY = iterateKey || Symbol();
    const objProxy: any = new Proxy<T>(data, {
        get(target: T, key: PropertyKey, receiver: any) {
            console.log("get", target, key);
            if (key === RAW) {
                return target;
            }

            // map & set for size
            if (
                (target instanceof Set || target instanceof Map) &&
                key === "size"
            ) {
                trackEnable(key, shouldTrack, option) &&
                    track(target, ITERATE_KEY);
                return Reflect.get(target, key, target);
            }

            // map
            if (target instanceof Map && key === "get" || key === 'set') {
                return getMapInstrumentations(option, ITERATE_KEY)[key];
            }

            // set for delete & add
            if (target instanceof Set && (key === "delete" || key === "add")) {
                return getSetInstrumentations(target, ITERATE_KEY)[key];
            }

            // array 部分方法重写
            if (
                Array.isArray(target) &&
                arrayInstrumentations.hasOwnProperty(key)
            ) {
                return Reflect.get(arrayInstrumentations, key, receiver);
            }

            trackEnable(key, shouldTrack, option) && track(target, key);

            // object
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
            let res;
            if (!originTarget.has(key)) {
                res = originTarget.add(key);
                trigger(originTarget, key, ITERATE_KEY, "ADD");
            }
            return res;
        },
        delete(key: any) {
            const originTarget = (this as any)[RAW];
            const res = originTarget.delete(key);
            if (res) {
                trigger(target, key, ITERATE_KEY, "DELETE");
            }
            return res;
        }
    };
    return setInstrumentations;
}

function getMapInstrumentations(
    option?: IReactiveOption,
    ITERATE_KEY?: symbol
) {
    return {
        get(key: any) {
            const originTarget = (this as any)[RAW];
            const res = originTarget.get(key);
            track(originTarget, key);

            if (option?.isShallow) {
                return res;
            }
            if (typeof res === "object" && res !== null) {
                return createReactive(res, option, ITERATE_KEY);
            }
            return res;
        },
        set(key: any, newVal: any) {
            const originTarget = (this as any)[RAW];
            const oldVal = originTarget.get(key);
            const has = originTarget.has(key);
            if (!has) {
                const res = originTarget.set(key, newVal);
                trigger(originTarget, key, ITERATE_KEY, 'ADD', newVal);
                return res;  
            }

            if (oldVal !== newVal && has) {
                const res = originTarget.set(key, newVal);
                trigger(originTarget, key, ITERATE_KEY, 'SET', newVal);
                return res;
            }
            return true;
        }
    };
}

function trackEnable(
    key: PropertyKey,
    shouldTrack: boolean,
    options?: IReactiveOption
) {
    return !options?.readonly && typeof key !== "symbol" && shouldTrack;
}
