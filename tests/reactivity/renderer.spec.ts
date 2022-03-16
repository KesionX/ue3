import {
    ref,
    toRef,
    effect,
    reactive,
    readonly,
    shallowReadonly,
    toRefs
} from "../../src/index";

describe("渲染器", function() {
    const app = document.createElement('div');
    app.id = 'app_renderer';
    app.style.width = '400px';
    app.style.height = '400px';
    app.style.zIndex = '9999';
    app.style.backgroundColor = '#fff';
    app.style.top = '50px';
    app.style.right = '20px';
    app.style.position = 'absolute';
    // document.body.style.width = '200px';
    // document.body.style.height = '200px';
    document.body.style.zIndex = '999999';
    document.body.appendChild(app);
    console.log(document.getElementsByClassName('spec-iframe'));
    // document.querySelector('.spec-iframe')[0].style.width = '100%';
    // document.querySelector('.spec-iframe')[0].style.height = '100%';

    it("1", () => {
        // cy.get('.spec-iframe').then((iframe) => {
        //     console.log(iframe);
        // })
        // console.log(document.body);
        // const useRef = ref(1);
        // expect(useRef.value).to.eq(1);
    });
});
