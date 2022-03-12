import {
    render,
    ref,
    effect,
    reactive,
    readonly,
    shallowReadonly
} from "../../src/index";

describe("响应式测试 => Map", function() {
    it("set 增加一个元素", function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        p.set(2, 2 as any);
        expect(p.size).to.equal(2);
    });

    it("set 增加一个元素，响应1次响应", function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        let count = 0;
        effect(() => {
            p.size;
            count++;
        });
        p.set(2, 2 as any);
        cy.wait(200);
        expect(p.size).to.equal(2);
        expect(count).to.equal(2);
    });

    it("set 增加一个object元素", function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        const obj = {};
        p.set(2, obj as any);
        expect(p.size).to.equal(2);
        // TODO p.get(2)为响应式对象
        // if (p.get(2) !== obj) {
        //     console.log('sss', p.get(2));
        //     expect(true).to.equal(false);
        // }
    });

    it("set 修改一个元素", function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        p.set(1, 2 as any);
        expect(p.size).to.equal(1);
        expect(s.get(1)).to.equal(2);
    });

    it("set 修改一个元素，再触发1次响应", function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        let count = 0;
        effect(() => {
            p.size;
            count++;
        });
        p.set(1, 2 as any);
        expect(p.size).to.equal(1);
        expect(s.get(1)).to.equal(2);
        cy.wait(200);
        expect(count).to.equal(2);
    });

    it("set 修改一个object类型元素", function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        p.get(1).a = 2;
        expect(s.get(1).a).to.equal(2);
        expect(p.size).to.equal(1);
    });

    it("set 修改一个object类型元素, 触发1次响应", function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        let count = 0;
        effect(() => {
            console.log(p.get(1).a);
            count++;
        });
        p.get(1).a = 2;
        expect(s.get(1).a).to.equal(2);
        expect(p.size).to.equal(1);
        cy.wait(200);
        expect(count).to.equal(2);
    });

    it("set 修改一个2级object类型元素", function() {
        const s = new Map([[1, { a: { b: 2 } }]]);
        const p = reactive(s);
        p.get(1).a.b = 3;
        expect(s.get(1).a.b).to.equal(3);
        expect(p.size).to.equal(1);
    });

    it("set 修改一个2级object类型元素, 触发1次响应", function() {
        const s = new Map([[1, { a: { b: 2 } }]]);
        const p = reactive(s);
        let count = 0;
        effect(() => {
            console.log(p.get(1).a.b);
            count++;
        });
        p.get(1).a.b = 3;
        expect(s.get(1).a.b).to.equal(3);
        expect(p.size).to.equal(1);
        cy.wait(200);
        expect(count).to.equal(2);
    });

    it("delete 删除一个元素", function() {
        const s = new Map([[1, 2]]);
        const p = reactive(s);
        p.delete(1);
        expect(s.size).to.eq(0);
    });

    it("delete 删除一个元素，再触发1次响应", function() {
        const s = new Map([[1, 2]]);
        const p = reactive(s);
        let count = 0;
        effect(() => {
            console.log(p.size);
            count++;
        });
        p.delete(1);
        expect(s.size).to.eq(0);
        cy.wait(200);
        expect(count).to.equal(2);
    });

    it("forEach", function() {
        const s = new Map([[1, 2]]);
        const p = reactive(s);
        p.forEach(element => {
            expect(element).to.equal(2);
        });
    });

    it("forEach 添加后再次触发响应", function() {
        const s = new Map([[1, 2]]);
        const p = reactive(s);
        effect(() => {
            p.forEach((element, key) => {
                console.log("key:", key, "value:", element);
                if (key === 1) {
                    expect(element).to.equal(2);
                }
                if (key === 2) {
                    expect(element).to.equal(3);
                }
            });
        });
        p.set(2, 3);
    });

    it("forEach 修改object类型内的值后再触发1次响应", async function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        let count = 0;
        effect(() => {
            count++;
            p.forEach((element, key) => {
                console.log(count, "修改后再次触发响应 key:", key, "value:", element.a);
            });
        });
        p.get(1).a = 3;
        expect(s.get(1).a).to.equal(3);
        cy.wait(200);
        expect(count).to.equal(2);
    });

    it("forEach 修改key对应的value值后再触发1次响应", async function() {
        const s = new Map([[1, { a: 1 }]]);
        const p = reactive(s);
        let count = 0;
        effect(() => {
            count++;
            p.forEach((element, key) => {
                console.log(count, "修改后再次触发响应 key:", key, "value:", element.a);
            });
        });
        p.set(1, 3 as any);
        expect(s.get(1)).to.equal(3);
        cy.wait(200);
        expect(count).to.equal(2);
    });
});
