import { createRenderer, ref, effect, reactive, readonly, shallowReadonly } from "../../dist/index.js";

const render = createRenderer().render;

const count = ref(0);
render({
    type: 'div',
    props: {
        id:"root"
    },
    key: '1',
    children: 'hello world',
}, document.getElementById('app'));
render({
    type: 'div',
    props: {
        id:"root"
    },
    key: '1',
    children: 'hello kesion',
}, document.getElementById('app'));