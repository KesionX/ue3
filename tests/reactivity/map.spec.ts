import { render, ref, effect, reactive, readonly, shallowReadonly } from "../../src/index";

describe('响应式测试 map', function () {
    it('增加一个原元素', function () {
        const s = new Map([[1, { a: 1}]]);
        const p = reactive(s);
        p.set(2, 2);
        expect(p.size).to.equal(2);
    })

    it('增加一个原元素，响应effect', function () {
        const s = new Map([[1, { a: 1}]]);
        const p = reactive(s);
        let count = 1;
        effect(() => {
            p.size;
            count++;
            if (count > 2) {
                expect(count).to.equal(3);
            }
        })
        p.set(2, 2);
    })
});