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

/**
 * 防止生成多个新的代理
 *  TODO 当删除的时候需要删除此代理
 */
const reactiveMap = new Map();

export function createReactive<T extends Record<PropertyKey, any>>(
    data: T,
    option?: IReactiveOption,
    iterateKey?: symbol,
    mapKeyIterateKey?: symbol
): T {
    if (reactiveMap.has(data)) {
        return reactiveMap.get(data);
    }
    const ITERATE_KEY = iterateKey || Symbol();
    const MAP_KEY_ITERATE_KEY = mapKeyIterateKey || Symbol();
    const objProxy: T = new Proxy<T>(data, {
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
            if (
                (target instanceof Map && key === "get") ||
                key === "set" ||
                key === "forEach" ||
                key === "delete" ||
                Object.prototype.toString.call(key) === "[object Symbol]" ||
                key === "entries" ||
                key === "values" ||
                key === "keys"
            ) {
                // @ts-ignore
                return getMapInstrumentations(ITERATE_KEY, getMapInstrumentations, option)[key];
            }

            // set for delete & add
            if (target instanceof Set && (key === "delete" || key === "add")) {
                return getSetInstrumentations(
                    target,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY
                )[key];
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
                return createReactive(
                    res,
                    option,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY
                );
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
                trigger(
                    target,
                    key,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY,
                    type,
                    newVal
                );
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
                trigger(
                    target,
                    key,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY,
                    "DELETE"
                );
            }
            return res;
        }
    });
    reactiveMap.set(data, objProxy);
    return objProxy;
}

function getSetInstrumentations(
    target: any,
    ITERATE_KEY: symbol,
    MAP_KEY_ITERATE_KEY: symbol
) {
    const setInstrumentations = {
        add(key: any) {
            const originTarget = (this as any)[RAW];
            let res;
            if (!originTarget.has(key)) {
                res = originTarget.add(key);
                trigger(
                    originTarget,
                    key,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY,
                    "ADD"
                );
            }
            return res;
        },
        delete(key: any) {
            const originTarget = (this as any)[RAW];
            const res = originTarget.delete(key);
            if (res) {
                trigger(
                    target,
                    key,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY,
                    "DELETE"
                );
            }
            return res;
        }
    };
    return setInstrumentations;
}

function filterReactiveOrData(
    data: any,
    ITERATE_KEY: symbol,
    MAP_KEY_ITERATE_KEY: symbol,
    option?: IReactiveOption
): any {
    if (option?.isShallow) {
        return data;
    }
    if (typeof data === "object" && data !== null) {
        return createReactive(data, option, ITERATE_KEY, MAP_KEY_ITERATE_KEY);
    }
    return data;
}

function iteratorMethod(
    this: any,
    ITERATE_KEY: symbol,
    MAP_KEY_ITERATE_KEY: symbol,
    methodType: "values" | "keys" | "iterator",
    option?: IReactiveOption
) {
    const originTarget = (this as any)[RAW];
    const itr =
        methodType === "values"
            ? originTarget.values()
            : methodType === "keys"
            ? originTarget.keys()
            : originTarget[Symbol.iterator]();
    methodType !== "keys"
        ? track(originTarget, ITERATE_KEY)
        : track(originTarget, MAP_KEY_ITERATE_KEY);
    return {
        next() {
            const { value, done } = itr.next();
            if (methodType === "keys" || methodType === "values") {
                return {
                    value: filterReactiveOrData(
                        value,
                        ITERATE_KEY,
                        MAP_KEY_ITERATE_KEY,
                        option
                    ),
                    done
                };
            }
            return {
                value: value
                    ? [
                          filterReactiveOrData(
                              value[0],
                              ITERATE_KEY,
                              MAP_KEY_ITERATE_KEY,
                              option
                          ),
                          filterReactiveOrData(
                              value[1],
                              ITERATE_KEY,
                              MAP_KEY_ITERATE_KEY,
                              option
                          )
                      ]
                    : value,
                done
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function getMapInstrumentations(
    ITERATE_KEY: symbol,
    MAP_KEY_ITERATE_KEY: symbol,
    option?: IReactiveOption
) {
    return {
        get(key: any) {
            const originTarget = (this as any)[RAW];
            const res = originTarget.get(key);
            track(originTarget, key);

            return filterReactiveOrData(
                res,
                ITERATE_KEY,
                MAP_KEY_ITERATE_KEY,
                option
            );
        },
        set(key: any, newVal: any) {
            const originTarget = (this as any)[RAW];
            const oldVal = originTarget.get(key);
            const has = originTarget.has(key);
            /**
             * 如果newValue是响应式数据，就意味着设置到原始对象上的也是响应是数据，
             * 我们把响应式数据设置到原始数据上的行为称为数据污染
             */
            const rawValue = newVal[RAW] || newVal;
            if (!has) {
                const res = originTarget.set(key, rawValue);
                trigger(
                    originTarget,
                    key,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY,
                    "ADD",
                    rawValue
                );
                return res;
            }
            // TODO 这个判断需要测试
            if (
                oldVal !== rawValue &&
                (oldVal === oldVal || rawValue === rawValue)
            ) {
                const res = originTarget.set(key, rawValue);
                trigger(
                    originTarget,
                    key,
                    ITERATE_KEY,
                    MAP_KEY_ITERATE_KEY,
                    "SET",
                    rawValue
                );
                return res;
            }
            return true;
        },
        forEach(
            callback: (v: any, k: any, context: any) => void,
            thisArg: any
        ) {
            const originTarget = (this as any)[RAW];
            track(originTarget, ITERATE_KEY);
            originTarget.forEach((v: any, k: any) => {
                callback.call(
                    thisArg,
                    filterReactiveOrData(
                        v,
                        ITERATE_KEY,
                        MAP_KEY_ITERATE_KEY,
                        option
                    ),
                    filterReactiveOrData(
                        k,
                        ITERATE_KEY,
                        MAP_KEY_ITERATE_KEY,
                        option
                    ),
                    this
                );
            });
        },
        delete(key: any) {
            const originTarget = (this as any)[RAW];
            const has = originTarget.has(key);
            if (!has) {
                return false;
            }
            const res = originTarget.delete(key);
            trigger(
                originTarget,
                key,
                ITERATE_KEY,
                MAP_KEY_ITERATE_KEY,
                "DELETE"
            );
            return res;
        },
        // for of
        [Symbol.iterator]() {
            return iteratorMethod.call(
                this,
                ITERATE_KEY,
                MAP_KEY_ITERATE_KEY,
                "iterator",
                option
            );
        },
        entries() {
            return iteratorMethod.call(
                this,
                ITERATE_KEY,
                MAP_KEY_ITERATE_KEY,
                "iterator",
                option
            );
        },
        values() {
            return iteratorMethod.call(
                this,
                ITERATE_KEY,
                MAP_KEY_ITERATE_KEY,
                "values",
                option
            );
        },
        keys() {
            return iteratorMethod.call(
                this,
                ITERATE_KEY,
                MAP_KEY_ITERATE_KEY,
                "keys",
                option
            );
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
