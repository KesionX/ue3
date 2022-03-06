import { track, trigger } from "./effect";

const data = {};
const ITERATE_KEY = Symbol()
const objProxy = new Proxy(data, {
    get(target: Record<string, any>, key: string, receiver) {
        track(target, key);
        // target[key]
        return Reflect.get(target, key, receiver);
    },
    set(target: Record<string, any>, key: string, val: any, receiver) {
        // target[key] = val;
        const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'; 

        const res = Reflect.set(target, key, val, receiver);
        trigger(target, key, ITERATE_KEY, type);
        return res;
    },
    // for  in
    has(target: Record<string, any>, key: string) {
        track(target, key);
        // target[key]
        return Reflect.has(target, key);
    },
    ownKeys(target) {
        track(target, ITERATE_KEY);
        return Reflect.ownKeys(target);
    }
});