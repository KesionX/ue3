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
        id:"root",
    },
    key: '1',
    children: [{
        type: 'div',
        key: 'root-children-1',
        props: {
            style: "width: 20px; height: 20px; background-color: red"
        }, 
        children: 'hello world',
    }, {
        type: 'div',
        key: 'root-children-2',
        props: {
            style: "width: 20px; height: 20px; background-color: red"
        }
    }],
}, document.getElementById('app'));