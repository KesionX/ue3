import { createRenderer, ref, effect, reactive, readonly, shallowReadonly } from "../../dist/index.js";

const render = createRenderer().render;

const count = ref(0);
effect(() => {

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
        }, {
            key: 'div-sub2-3',
            type: 'div',
            props: {
                style: 'width: 125px; height: 125px; background: blue;',
            },
            children: [{
                key: 'div-sub3-1',
                type: 'div',
                children: 'k',
            }, {
                key: 'div-sub3-2',
                type: 'div',
                children: count.value + '',
            }]
        }],
    }, document.getElementById('app-2'));

});

// setInterval(() => {
//     count.value = count.value + 1;
// }, 1000);




setTimeout(() => {
    render({
        type: 'div',
        key: 'div-sub1-1',
        props: {
            class: 'app-2'
        },
        children: [{
            key: 'div-sub2-2',
            type: 'b',
            children: 'world'
        }, {
            key: 'div-sub2-1',
            type: 'span',
            props: {
                style: 'color: yellow'
            },
            children: 'hello'
        }, {
            key: 'div-sub2-3',
            type: 'div',
            props: {
                style: 'width: 125px; height: 125px; background: blue;',
            },
            children: [{
                key: 'div-sub3-1',
                type: 'div',
                children: 'k',
            }, {
                key: 'div-sub3-2',
                type: 'div',
                children: count.value + '',
            }]
        }],
    }, document.getElementById('app-2'));
}, 3000);