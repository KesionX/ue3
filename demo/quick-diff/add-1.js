import { createRenderer, ref, effect, reactive, readonly, shallowReadonly } from "../../dist/index.js";

const render = createRenderer().render;

const count = ref(0);
render({
    type: 'div',
    props: {
        id:"root"
    },
    key: '1',
    children: [{
        type: 'div',
        key: 'root-children-1',
        children: 'hello',
    }],
}, document.getElementById('app'));
render({
    type: 'div',
    props: {
        id:"root"
    },
    key: '1',
    children: [{
        type: 'div',
        key: 'root-children-1',
        children: 'hello',
    }, {
        type: 'div',
        key: 'root-children-2',
        children: 'world',
    }],
}, document.getElementById('app'));