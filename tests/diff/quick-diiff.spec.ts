import {
    ref,
    toRef,
    effect,
    reactive,
    readonly,
    shallowReadonly,
    toRefs
} from "../../src/index";

describe("快速 diff", function() {
    it("更新内容", () => {
        cy.visit("../../demo/quick-diff/update-1.html").then(() => {
            cy.get("#root").contains('hello kesion');
        });
    });
    it("更新内容与样式", () => {
        cy.visit("../../demo/quick-diff/update-2.html").then(() => {
            cy.get("#root").contains('hello kesion');
            cy.get("#root").then((el) => {
                expect(el.get()[0].style.color).to.eql('red');
            })
        });
    });
    it("更新div为a", () => {
        cy.visit("../../demo/quick-diff/update-3.html").then(() => {
            cy.get("#root").contains('hello kesion');
            cy.get("#root").then((el) => {
                expect(el.get()[0].style.color).to.eql('red');
                expect(el.get()[0].tagName).to.eql('A');
            })
        });
    });
    it("更新子节点，1个子节点改为2个", () => {
        cy.visit("../../demo/quick-diff/update-4.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(2);
                expect(el.get()[0].firstElementChild.textContent).to.eql('hello world');
            })
        });
    });
    it("新增节点，在后面增加1个节点，p1 => p1,p2", () => {
        cy.visit("../../demo/quick-diff/add-1.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(2);
                expect(el.get()[0].firstElementChild.textContent).to.eql('hello');
                expect(el.get()[0].lastElementChild.textContent).to.eql('world');
            })
        });
    });
    it("新增节点，前后都增加一个节点, p1 => p0,p1,p2", () => {
        cy.visit("../../demo/quick-diff/add-2.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(3);
                expect(el.get()[0].firstElementChild.textContent).to.eql('pre');
                expect(el.get()[0].lastElementChild.textContent).to.eql('world');
            })
        });
    });
    it("新增节点，前中后都增加一个节点, p1,p2  => p0,p1,p3,p2,p4", () => {
        cy.visit("../../demo/quick-diff/add-3.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(5);
                expect(el.get()[0].firstElementChild.textContent).to.eql('pre');
                expect(el.get()[0].childNodes[1].textContent).to.eql('hello');
                expect(el.get()[0].childNodes[2].textContent).to.eql('center');
                expect(el.get()[0].childNodes[3].textContent).to.eql('world');
                expect(el.get()[0].lastElementChild.textContent).to.eql('end');
            })
        });
    });
    it("新增节点，前中后都增加一个节点, p1,p2  => p1,p3{p3-1,p3-2},p2", () => {
        cy.visit("../../demo/quick-diff/add-4.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(3);
                expect(el.get()[0].childNodes[0].textContent).to.eql('p1');
                expect(el.get()[0].childNodes[2].textContent).to.eql('p2');
                expect(el.get()[0].childNodes[1].childNodes.length).to.eql(2);
            })
        });
    });
    it("移动节点，2个节点互换位置, p1,p2 => p2,p1", () => {
        cy.visit("../../demo/quick-diff/move-1.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(2);
                expect(el.get()[0].firstElementChild.textContent).to.eql('world');
                expect(el.get()[0].lastElementChild.textContent).to.eql('hello');
            })
        });
    });
    it("移动节点，p1,p2,p3 => p2,p3,p1", () => {
        cy.visit("../../demo/quick-diff/move-2.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(3);
                expect(el.get()[0].firstElementChild.textContent).to.eql('p2');
                expect(el.get()[0].lastElementChild.textContent).to.eql('p1');
            })
        });
    });
    it("删除节点，p1,p2 => p2", () => {
        cy.visit("../../demo/quick-diff/delete-1.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(1);
                expect(el.get()[0].firstElementChild.textContent).to.eql('p2');
            })
        });
    });
    it("删除节点，p1,p2,p3 => p2", () => {
        cy.visit("../../demo/quick-diff/delete-2.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(1);
                expect(el.get()[0].firstElementChild.textContent).to.eql('p2');
            })
        });
    });
    it("删除节点，p1,p2,p3 => p1,p3", () => {
        cy.visit("../../demo/quick-diff/delete-3.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(2);
                expect(el.get()[0].firstElementChild.textContent).to.eql('p1');
                expect(el.get()[0].lastElementChild.textContent).to.eql('p3');
            })
        });
    });
    it("新增并移动节点，p1,p2,p3 => p3,p2,p4,p1", () => {
        cy.visit("../../demo/quick-diff/add-move-1.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(4);
                expect(el.get()[0].childNodes[0].textContent).to.eql('p3');
                expect(el.get()[0].childNodes[1].textContent).to.eql('p2');
                expect(el.get()[0].childNodes[2].textContent).to.eql('p4');
                expect(el.get()[0].childNodes[3].textContent).to.eql('p1');
            })
        });
    });
    it("新增并移动节点，p1,p2,p3 => p0,p3,p2,p4,p1,p5", () => {
        cy.visit("../../demo/quick-diff/add-move-2.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(6);
                expect(el.get()[0].childNodes[0].textContent).to.eql('p0');
                expect(el.get()[0].childNodes[1].textContent).to.eql('p3');
                expect(el.get()[0].childNodes[2].textContent).to.eql('p2');
                expect(el.get()[0].childNodes[3].textContent).to.eql('p4');
                expect(el.get()[0].childNodes[4].textContent).to.eql('p1');
                expect(el.get()[0].childNodes[5].textContent).to.eql('p5');
            })
        });
    });
    it("新增并移动节点，p1,p2,p3 => p-1,p0,p3,p6,p2,p4,p1,p5,p7", () => {
        cy.visit("../../demo/quick-diff/add-move-3.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(9);
                expect(el.get()[0].childNodes[0].textContent).to.eql('p-1');
                expect(el.get()[0].childNodes[1].textContent).to.eql('p0');
                expect(el.get()[0].childNodes[2].textContent).to.eql('p3');
                expect(el.get()[0].childNodes[3].textContent).to.eql('p6');
                expect(el.get()[0].childNodes[4].textContent).to.eql('p2');
                expect(el.get()[0].childNodes[5].textContent).to.eql('p4');
                expect(el.get()[0].childNodes[6].textContent).to.eql('p1');
                expect(el.get()[0].childNodes[7].textContent).to.eql('p5');
                expect(el.get()[0].childNodes[8].textContent).to.eql('p7');
            })
        });
    });
    it("删除并移动，p1,p2,p3 => p3,p1", () => {
        cy.visit("../../demo/quick-diff/delete-move-1.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(2);
                expect(el.get()[0].firstElementChild.textContent).to.eql('p3');
                expect(el.get()[0].lastElementChild.textContent).to.eql('p1');
            })
        });
    });
    it("删除并移动，p1,p2,p3,p4 => p3,p2", () => {
        cy.visit("../../demo/quick-diff/delete-move-2.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(2);
                expect(el.get()[0].firstElementChild.textContent).to.eql('p3');
                expect(el.get()[0].lastElementChild.textContent).to.eql('p2');
            })
        });
    });
    it("删除并移动，p1,p2,p3,p4,p5 => p4,p2", () => {
        cy.visit("../../demo/quick-diff/delete-move-3.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(2);
                expect(el.get()[0].firstElementChild.textContent).to.eql('p4');
                expect(el.get()[0].lastElementChild.textContent).to.eql('p2');
            })
        });
    });
    it("删除、移动、新增，p1,p2,p3,p4,p5 => p4,p7,p2,p6", () => {
        cy.visit("../../demo/quick-diff/add-delete-move-1.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(4);
                expect(el.get()[0].childNodes[0].textContent).to.eql('p4');
                expect(el.get()[0].childNodes[1].textContent).to.eql('p7');
                expect(el.get()[0].childNodes[2].textContent).to.eql('p2');
                expect(el.get()[0].childNodes[3].textContent).to.eql('p6');
            })
        });
    });
    it("删除、移动、新增、修改，p1,p2,p3,p4,p5 => p4-update,p7,p2-update,p6", () => {
        cy.visit("../../demo/quick-diff/add-delete-move-2.html").then(() => {
            cy.get("#root").then((el) => {
                expect(el.get()[0].childElementCount).to.eql(4);
                expect(el.get()[0].childNodes[0].textContent).to.eql('p4-update');
                expect(el.get()[0].childNodes[1].textContent).to.eql('p7');
                expect(el.get()[0].childNodes[2].textContent).to.eql('p2-update');
                expect(el.get()[0].childNodes[3].textContent).to.eql('p6');
            })
        });
    });
});
