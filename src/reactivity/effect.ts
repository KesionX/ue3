export type EffectOptions = {
    scheduler?: (fn: Function) => void;
    lazy?: boolean;
};
export type EffectFunction<T> = {
    (): T;
    deps: Set<Function>[];
    options?: EffectOptions;
};
export type TriggerType = "ADD" | "SET" | "DELETE";
export type TriggrtFunction = (
    target: Record<string, any>,
    key: PropertyKey,
    ITERATE_KEY?: symbol,
    type?: TriggerType,
    newVal?: any
) => void;

let activeEffect: undefined | EffectFunction<any>;
const bucket = new WeakMap<any, Map<PropertyKey, Set<EffectFunction<any>>>>();
const effectStack: EffectFunction<any>[] = [];

export function effect<T>(fn: () => T, options?: EffectOptions) {
    const effectFn: EffectFunction<T> = () => {
        // 清除之前的effect
        cleanup(effectFn);
        activeEffect = effectFn;
        // 压入栈中
        effectStack.push(effectFn);
        const res = fn();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
        return res;
    };
    effectFn.deps = [] as Set<Function>[];
    effectFn.options = options;
    if (!options?.lazy) {
        effectFn();
    }
    return effectFn;
}

/**
 * 清除之前的绑定，用于刷新绑定effect
 * 可解决分支切换问题、比如三元
 * @param effectFn
 */
function cleanup<T>(effectFn: EffectFunction<T>) {
    for (let index = 0; index < effectFn.deps.length; index++) {
        const deps = effectFn.deps[index];
        deps.delete(effectFn);
    }
    effectFn.deps.length = 0;
}

export function track(target: Record<string, any>, key: PropertyKey) {
    if (!activeEffect) return;
    // data or props
    let depsMap = bucket.get(target);
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()));
    }
    // 属性值对应的set，set里可能存在多个effect函数
    let deps: Set<EffectFunction<any>> | undefined = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    // 属性对应的effect函数、effect可能存在多个、同个则覆盖
    deps.add(activeEffect);
    // 将当前effect添加依赖的effect
    activeEffect.deps.push(deps);
}

export function trigger(
    target: Record<string, any>,
    key: PropertyKey,
    ITERATE_KEY?: symbol,
    type?: TriggerType,
    newVal?: any
) {
    const depsMap = bucket.get(target);
    if (!depsMap) return;
    // 获取对应值的所有 effects
    const effects: Set<EffectFunction<any>> | undefined = depsMap.get(key);

    // 取得与ITERATE_KEY关联的副作用函数
    let iterateEffects: Set<EffectFunction<any>> | undefined;
    if (ITERATE_KEY) {
        iterateEffects = depsMap.get(ITERATE_KEY);
    }

    // 分支--防止无限循环
    const effectsToRun = new Set<EffectFunction<any>>();

    effects &&
        effects.forEach(effectFn => {
            if (activeEffect !== effectFn) {
                effectsToRun.add(effectFn);
            }
        });

    // array
    if (type === "ADD" && Array.isArray(target)) {
        const lengthEffects = depsMap.get("length");
        lengthEffects &&
            lengthEffects.forEach(effectFn => {
                if (activeEffect !== effectFn) {
                    effectsToRun.add(effectFn);
                }
            });
    }
    if (Array.isArray(target) && key === "length") {
        depsMap.forEach((effects, key) => {
            if ((key as number) >= (newVal as number)) {
                effects.forEach(effectFn => {
                    if (activeEffect !== effectFn) {
                        effectsToRun.add(effectFn);
                    }
                });
            }
        });
    }

    // object
    (type === "ADD" || type === "DELETE") &&
        iterateEffects &&
        iterateEffects.forEach(effectFn => {
            if (activeEffect !== effectFn) {
                effectsToRun.add(effectFn);
            }
        });

    effectsToRun.forEach(effectFn => {
        // 调度器执行
        if (effectFn?.options?.scheduler) {
            effectFn?.options.scheduler(effectFn);
        } else {
            effectFn();
        }
    });
}
