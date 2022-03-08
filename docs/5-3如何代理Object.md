# 如何代理 Object

## 对一个对象肯存在读取的操作

- obj.name
- key: key in obj
- for (key in obj) {}
- set
- add
- delete

## 如何拦截读取操作

### 1. obj.name

拦截方法：get

```typescript
new Proxy(
    {},
    {
        get(target, key, receiver) {
            track(target, key);
            return Reflect.get(target, key, receiver);
        }
    }
);
```

### 2. in 操作

明确 in 操作符的运行时逻辑，详细请看 ECMA-262 [ECMA-262 - in](https://262.ecma-international.org/12.0/#sec-relational-operators)

拦截方法：has

```typescript
new Proxy(
    {},
    {
        has(target, key) {
            track(target, key);
            return Reflect.get(target, key);
        }
    }
);
```

### 3. for in

拦截方法：ownKeys，并为代理对象添加唯一标识 Symbol

```typescript
new Proxy(
    {},
    {
        ownKeys(target, key) {
            track(target, ITERATE_KEY);
            return Reflect.ownKeys(target, key);
        }
    }
);
```

### 4. set

拦截方法：set

```typescript
new Proxy(
    {},
    {
        set(target: Record<string, any>, key: string, val: any, receiver) {
            const type = Object.prototype.hasOwnProperty.call(target, key)
                ? "SET"
                : "ADD";
            const res = Reflect.set(target, key, val, receiver);
            trigger(target, key, ITERATE_KEY, type);
            return res;
        }
    }
);
```

### 5. add

拦截方法：set

```typescript
new Proxy(
    {},
    {
        set(target: Record<string, any>, key: string, val: any, receiver) {
            const type = Object.prototype.hasOwnProperty.call(target, key)
                ? "SET"
                : "ADD";
            const res = Reflect.set(target, key, val, receiver);
            trigger(target, key, ITERATE_KEY, type);
            return res;
        }
    }
);
```

### 6.delete

拦截方法：deleteProperty

``` typescript
deleteProperty(target: Record<string, any>, key: string) {
    const hadKey  = Object.prototype.hasOwnProperty.call(target, key);
    const res = Reflect.deleteProperty(target, key);
    if (res && hadKey) {
        trigger(target, key, ITERATE_KEY, 'DELETE');
    }
    return res;
}
```

## 合理地触发响应

- 当值不变的情况下不触发响应
- NaN值的比较 NaN !== NaN // true
- 原型链继承属性的情况 // Reflect 实际上实现了访问属性的默认行为

``` typescript
set(target: T, key: PropertyKey, newVal: any, receiver: any) {
    // 旧值
    const oldVal = target[key];
    const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';
    const res = Reflect.set(target, key, newVal, receiver);
    if (target === receiver[RAW] && //原型链问题
        oldVal !== newVal &&
        // 比较新值与旧值，并且都不是NaN的时候才触发响应
        (oldVal === oldVal || newVal === newVal)) {
        trigger(target, key, ITERATE_KEY, type);
    }
    return res;
}
```

### 深响应与浅响应

