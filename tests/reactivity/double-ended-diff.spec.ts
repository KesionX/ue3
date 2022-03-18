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
    it("添加", () => {
        cy.visit("../../demo/double-ended/add-1.html").then(() => {
            cy.get(".app-2").find('.div-sub2-2');
            cy.get(".div-sub2-2").contains('kesion');
        });
    });
    it("删除", () => {
        cy.visit("../../demo/double-ended/delete-1.html").then(() => {
            cy.get(".app-2").not('.div-sub2-2');
        });
    });
});
