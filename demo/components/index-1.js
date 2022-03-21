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
            type: Object
        }
    },
    setup(props) {
        const countRef = ref({
            a: 1
        });

        // setInterval(() => {
        //     countRef.value.a = countRef.value.a + 1;
        // }, 1000);
        return () => {
            return {
                type: "div",
                children: "hello" + props.count.a
            };
        };
    }
});

const render = createRenderer().render;
const countRef = ref({
    a: 1
});
setInterval(() => {
    countRef.value.a = countRef.value.a + 1;
}, 1000);
console.log('countRef', countRef);
render(
    {
        type: "div",
        children: [
            {
                type: MyComponent,
                props: {
                    count: countRef.value
                }
            }
        ]
    },
    document.getElementById("app")
);
