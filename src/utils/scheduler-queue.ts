const queue = new Set();
let isFlushing = false;

const p = Promise.resolve();

export function queueTask(task: Function) {
    queue.add(task);
    if (!isFlushing) {
        isFlushing = true;
        p.then(() => {
            try {
                queue.forEach((fn: any) => {
                    fn && fn();
                });
            } finally {
                isFlushing = false;
                queue.clear();
            }
        });
    }
}
