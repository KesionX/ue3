import { effect } from "./effect.js";

export type WatchOptions = { immediate?: boolean, flush?: 'pre' | 'post' | 'sync' }

export function watch<T>(source: () => T | Object, callback: (newVal: T, oldVal: T) => void, options?: WatchOptions) {
    let getter: Function;
    if (typeof source === 'function') {
        getter = source
    } else {
        getter = () => traverse(source)
    }
    let forNewVal: T;
    let forOldVal: T;

    const job = () => {
        forNewVal = effectFn();
        callback && callback(forNewVal, forOldVal);
        forOldVal = forNewVal;
    } 

    const effectFn = effect<T>(() => getter(), {
        lazy: true,
        scheduler() {
            if (options?.flush === 'post') {
                // 将其放入微队列处理
                Promise.resolve().then(job);
            } else {
                job();
            }
        }
    });
    if (options?.immediate) {
        job();
    } else {
        forOldVal = effectFn();
    }
}

function traverse(value: any, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) return;
    seen.add(value);
    for (const key in value) {
        traverse(value[key], seen);
    }
    return value;
}