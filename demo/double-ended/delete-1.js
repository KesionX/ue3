import { createRenderer, ref, effect, reactive, readonly, shallowReadonly } from "../../dist/index.js";

const render = createRenderer().render;

const count = ref(0);
render({
    type: 'div',
    key: 'div-sub1-1',
    props: {
        class: 'app-2'
    },
    children: [{
        key: 'div-sub2-1',
        type: 'span',
        props: {
            style: 'color: yellow'
        },
        children: 'hello'
    }, {
        key: 'div-sub2-2',
        type: 'b',
        children: 'world'
    }],
}, document.getElementById('app'));

render({
    type: 'div',
    key: 'div-sub1-1',
    props: {
        class: 'app-2'
    },
    children: [{
        key: 'div-sub2-1',
        type: 'span',
        props: {
            style: 'color: yellow'
        },
        children: 'hello'
    }],
}, document.getElementById('app'));