import {
    createRenderer,
    ref,
    effect,
    reactive,
    readonly,
    shallowReadonly,
    defineComponent
} from "../../dist/index.js";

const MyComponent = defineComponent({
    props: {
        count: {
            type: Number,
            default: 0
        }
    },
    setup(props) {
        const countRef = ref(0);

        setInterval(() => {
            countRef.value = countRef.value + 1;
        }, 1000);
        return () => {
            return {
                type: "div",
                children: countRef.value + "hello" + props.count
            };
        };
    }
});

const render = createRenderer().render;

render({
    type: MyComponent,
    props: {
        count: 1
    }
}, document.getElementById('app'));
