import {
    render,
    ref,
    toRef,
    effect,
    reactive,
    readonly,
    shallowReadonly,
    toRefs
} from "../../src/index";

describe("原始值的响应式", function() {
    it("ref 设置值为1", () => {
        const useRef = ref(1);
        expect(useRef.value).to.eq(1);
    });

    it("ref 设置改变，触发1响应", () => {
        const useRef = ref(1);
        expect(useRef.value).to.eq(1);
        let count = 0;
        effect(() => {
            count++;
            cy.log("useRef.value:", useRef.value);
        });
        useRef.value = 2;
        cy.wait(50);
        expect(count).to.eq(2);
    });

    it("toRef 修改toRef值", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        const fooRef = toRef(state, 'foo');
        fooRef.value++;
        expect(fooRef.value).to.eq(2);
        expect(state.foo).to.eq(2);
    });

    it("toRef 修改toRef值, 并触发1次响应", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        const fooRef = toRef(state, 'foo');
        let count = 0;
        effect(() => {
            count++;
            cy.log('state.foo:', state.foo);
        })
        fooRef.value++;
        expect(fooRef.value).to.eq(2);
        expect(state.foo).to.eq(2);
        cy.wait(50);
        expect(count).to.eq(2);
    });

    it("toRef 修改reactive值", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        const fooRef = toRef(state, 'foo');
        state.foo++;
        expect(fooRef.value).to.eq(2);
        expect(state.foo).to.eq(2);
    });

    it("toRef 修改reactive值, 并触发1次响应", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        const fooRef = toRef(state, 'foo');
        let count = 0;
        effect(() => {
            count++;
            cy.log('fooRef.foo:', fooRef.value);
        })
        state.foo++;
        expect(fooRef.value).to.eq(2);
        expect(state.foo).to.eq(2);
        cy.wait(50);
        expect(count).to.eq(2);
    });

    it("toRefs", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        const fooRef = toRefs(state);
        expect(fooRef.foo.value).to.eq(1);
        expect(fooRef.bar.value).to.eq(2);
    });

    it("toRefs, fooRef修改值", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        const fooRef = toRefs(state);
        fooRef.foo.value = 3;
        expect(state.foo).to.eq(3);
        expect(fooRef.bar.value).to.eq(2);
    });

    it("toRefs, fooRef修改值，并触发1次响应", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        let count = 0;
        effect(() => {
            count++;
            cy.log('state.foo:', state.foo);
        })
        const fooRef = toRefs(state);
        fooRef.foo.value = 3;
        expect(state.foo).to.eq(3);
        expect(fooRef.bar.value).to.eq(2);
        cy.wait(50);
        expect(count).to.eq(2);
    });

    it("toRefs, reactive修改值，并触发1次响应", () => {
        const state = reactive({
            foo: 1,
            bar: 2
        });
        let count = 0;
        const fooRef = toRefs(state);
        effect(() => {
            count++;
            cy.log('state.foo:', fooRef.foo.value);
        })
        state.foo = 3;
        expect(state.foo).to.eq(3);
        expect(fooRef.bar.value).to.eq(2);
        cy.wait(50);
        expect(count).to.eq(2);
    });
});
