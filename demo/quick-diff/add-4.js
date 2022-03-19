import { createRenderer, ref, effect, reactive, readonly, shallowReadonly } from "../../dist/index.js";

const render = createRenderer().render;

const count = ref(0);

// // hello => pre 、 hello 、 world
// render({
//     type: 'div',
//     props: {
//         id:"root"
//     },
//     key: '1',
//     children: [{
//         type: 'div',
//         key: 'root-children-1',
//         children: 'hello',
//     }],
// }, document.getElementById('app'));
// render({
//     type: 'div',
//     props: {
//         id:"root"
//     },
//     key: '1',
//     children: [{
//         type: 'div',
//         key: 'root-children-0',
//         props: {
//             style: 'background-color: blue',
//         },
//         children: 'pre',
//     }, {
//         type: 'div',
//         key: 'root-children-1',
//         children: 'hello',
//     }, {
//         type: 'div',
//         key: 'root-children-2',
//         children: 'world',
//     }],
// }, document.getElementById('app'));

// hello、world => pre、hello、center、world、end
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
        children: 'p1',
    }, {
        type: 'div',
        key: 'root-children-3',
        children: [{
            type: 'div',
            key: 'root-children-3-1',
            children: 'p3-1',   
        }, {
            type: 'div',
            key: 'root-children-3-2',
            children: 'p3-2',   
        }],
    }, {
        type: 'div',
        key: 'root-children-2',
        children: 'p2',
    }],
}, document.getElementById('app'));