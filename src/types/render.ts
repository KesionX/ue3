export interface RendererAdapter {
    /**
     * 创建元素
     */
    createElement: (tag: string) => HTMLElement;
    /**
     * 插入
     */
    insert: (el: HTMLElement | Text, parent: HTMLElement, anchor?: any) => void;
    /**
     * 设置元素text
     */
    setElementText: (el: HTMLElement, text: string) => void;
    /**
     * 设置属性值
     */
    patchProps: (el: HTMLElement, key: string, prevValue: any, nextValue: any) => void;
    /**
     * 创建text
     */
    createText: (text: string) => Text;
    /**
     * 配置text值
     */
    setText: (el: HTMLElement, text: string) => void;
}
