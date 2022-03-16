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

render({
    type: 'div',
    props: {
        style: 'color: red'
    },
    children: [{
        type: 'span',
        props: {
            style: 'color: green'
        },
        children: 'hello'
    }],
}, document.getElementById('app'));

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
    }],
}, document.getElementById('app-2'));
