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
        children: 'p1',
    }, {
        type: 'div',
        key: 'root-children-2',
        children: 'p2',
    }, {
        type: 'div',
        key: 'root-children-3',
        children: 'p3',
    }, {
        type: 'div',
        key: 'root-children-4',
        children: 'p4',
    }, {
        type: 'div',
        key: 'root-children-5',
        children: 'p5',
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
        key: 'root-children-4',
        children: 'p4',
    }, {
        type: 'div',
        key: 'root-children-2',
        children: 'p2',
    }],
}, document.getElementById('app'));