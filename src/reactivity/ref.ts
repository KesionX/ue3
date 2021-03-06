import { reactive } from "./reactive";
import { ToRefs, ToRef } from "../types";
export const __V_IS_REF = "__v_isref";

/**
 * 将普通对象或原始值转为响应式对象
 * @param data 普通对象
 */
export function ref(data: any) {
    const wrap = {
        value: data
    };
    Object.defineProperty(wrap, __V_IS_REF, {
        value: true
    });
    return reactive(wrap);
}

/**
 * @param obj 响应式对象
 */
export function toRefs<T extends Object>(obj: T) {
    const ret = {} as ToRefs<T>;
    for (const key in obj) {
        ret[key] = toRef<any, any>(obj, key) as ToRef<any>;
    }
    return ret;
}

/**
 * 转为ref
 * @param obj 响应式对象
 * @param key 响应式对象key
 */
export function toRef<T extends Object, K extends keyof T>(
    obj: T,
    key: K
) {
    const wrap = {
        get value() {
            return obj[key];
        },
        set value(val) {
            obj[key] = val;
        }
    };
    Object.defineProperty(wrap, __V_IS_REF, {
        value: true
    });
    return wrap;
}

export function proxyRefs<T extends Object>(obj: T): T {
    const p = new Proxy<T>(obj, {
        get(target: any, key: any, receiver) {
            const value = Reflect.get(target, key, receiver);
            return value[__V_IS_REF] ? value.value : value;
        },
        set(target: any, key: any, newVal: any, receiver) {
            const value = target[key];
            if (value[__V_IS_REF]) {
                target[key] = newVal;
                return true;
            }
            return Reflect.set(target, key, newVal, receiver);
        }
    });
    return p;
}