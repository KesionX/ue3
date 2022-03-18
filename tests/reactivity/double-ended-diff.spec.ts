import {
    ref,
    toRef,
    effect,
    reactive,
    readonly,
    shallowReadonly,
    toRefs
} from "../../src/index";

describe("双端diff", function() {
    it("修改", () => {
        cy.visit("../../demo/double-ended/update.html").then(() => {
            cy.get(".div-sub2-2").contains('kesion');
        });
    });
});
