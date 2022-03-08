import { render, ref, effect, reactive, readonly, shallowReadonly } from "../dist/index.js";

// test simple
// render({
//     tag: 'div',
//     props: {

//     },
//     children: 'hello',
// }, document.getElementById('app'));


function MyComponent() {
    return {
        tag: 'b',
        children: 'world'
    }
}

render({
    tag: 'div',
    props: {
        style: 'color: red'
    },
    children: [{
        tag: 'span',
        props: {
            style: 'color: green'
        },
        children: 'hello'
    }, {
        tag: MyComponent
    }],
}, document.getElementById('app'));

render({
    tag: 'div',
    props: {
        class: 'app-2'
    },
    children: [{
        tag: 'span',
        props: {
            style: 'color: green'
        },
        children: 'hello'
    }, {
        tag: 'b',
        children: 'world'
    }],
}, document.getElementById('app-2'));

// const oo = {
//     a: 1,
//     b: 2,
//     get bar() {
//         return this.a
//     }
// }
// const objA = ref(oo)
// effect(() => {
//     console.log('===', objA.a);
// });

// 原型链
// const obj = {};
// const proto = { bar: 1 };
// const child = reactive(obj);
// const parent = reactive(proto);
// Object.setPrototypeOf(child, parent);

// effect(() => {
//     console.log('===', child.bar);
// });

// child.bar = 2;

// 深响应浅响应
// const obj = {
//     a: {
//         b: 1
//     }
// }
// const p = reactive(obj);
// effect(() => {
//     console.log('===', p.a.b);
// });

// p.a.b = 2;

// readonly
// const obj = {
//     a: {
//         b: 1
//     }
// }
// const p = readonly(obj);
// effect(() => {
//     console.log('===', p.a.b);
// });

// p.a.b = 2;

// shallowReadonly
const obj = {
    a: {
        b: 1
    }
}
const p = shallowReadonly(obj);
effect(() => {
    console.log('===', p.a.b);
});

p.a.b = 2;

console.log(obj);