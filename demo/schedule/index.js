import { createRenderer, ref, effect, reactive, readonly, shallowReadonly } from "../../dist/index.js";
import { queueTask } from "../../dist/utils/scheduler-queue.js";


const countRef = ref(0);


effect(() => {
    console.log(countRef.value);
}, {
    scheduler: queueTask,
});

for (let index = 0; index < 50; index++) {
    countRef.value = index;
}