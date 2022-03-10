import { effect, track, trigger } from "./effect";

export function computed<T>(getting: () => T) {
    let value: T;
    let dirty = true;
    const effectFn = effect<T>(getting, {
        lazy: true,
        scheduler() {
            if (!dirty) {
                dirty = true;
                trigger(obj, "value");
            }
        }
    });

    // read-only
    const obj = {
        // 只有当读取改值的时候才会执行effectFn
        get value() {
            if (dirty) {
                value = effectFn();
                dirty = false;
            }
            track(obj, "value");
            return value;
        }
    };
    return obj;
}
