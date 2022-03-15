export interface RendererAdapter {
    /**
     * 创建元素
     */
    createElement: (tag: string) => HTMLElement;
    /**
     * 插入
     */
    insert: (el: HTMLElement, parent: HTMLElement, anchor?: any) => void;
    /**
     * 设置元素text
     */
    setElementText: (el: HTMLElement, text: string) => void;
    /**
     * 设置属性值
     */
    patchProps: (el: HTMLElement, key: string, prevValue: any, nextValue: any) => void; 
}
