import { createRenderer, ref, effect, reactive, readonly, shallowReadonly } from "../dist/index.js";

// test simple
// render({
//     type: 'div',
//     props: {

//     },
//     children: 'hello',
// }, document.getElementById('app'));


function MyComponent() {
    return {
        type: 'b',
        children: 'world'
    }
}

const render = createRenderer().render;

// render({
//     type: 'div',
//     props: {
//         style: 'color: red'
//     },
//     children: [{
//         type: 'span',
//         props: {
//             style: 'color: green'
//         },
//         children: 'hello'
//     }],
// }, document.getElementById('app'));


const count = ref(0);
effect(() => {

    render({
        type: 'div',
        props: {
            class: 'app-2'
        },
        children: [{
            type: 'span',
            props: {
                style: 'color: yellow'
            },
            children: 'hello'
        }, {
            type: 'b',
            children: 'world'
        }, {
            type: 'div',
            props: {
                style: 'width: 125px; height: 125px; background: blue;',
            },
            children: [{
                type: 'div',
                children: 'k',
            }, {
                type: 'div',
                children: count.value + '',
            }]
        }],
    }, document.getElementById('app-2'));

});

// setInterval(() => {
//     count.value = count.value + 1;
// }, 10000);