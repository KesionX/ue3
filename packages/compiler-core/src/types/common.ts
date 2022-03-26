/**
 * @markdown
 * ## 节点类型
 *
 */
export const enum NodeTypes {
    ROOT,
    ELEMENT,
    ATTRIBUTE,
    DIRECTIVE,

    TEXT
}

declare type none = undefined | null;

/**
 * @markdown
 * ## 解析模式
 *
 * |: mode    |: 解析HTML标签 |: 解析HTML实体 |
 * | DATA     |     YES      |     NO      |
 * | RCDATA   |     NO       |     YES     |
 * | RAWTEXT  |     NO       |     NO      |
 * | RAWTEXT  |     NO       |     NO      |
 */
export enum TextModes {
    DATA,
    RCDATA,
    RAWTEXT,
    CDATA
}

export interface Position {
    offset: number; // from start of file
    line?: number;
    column?: number;
}

export interface SourceLocation {
    start: Position;
    end: Position;
    source: string;
}

export interface Node {
    type: NodeTypes;
    loc?: SourceLocation;
}

export interface RootNode extends Node {
    children?: Node[] | none;
}

export interface TextNode extends Node {
    type: NodeTypes.TEXT;
    content: string;
}

export interface AttributeNode extends Node {
    type: NodeTypes.ATTRIBUTE;
    name: string;
    value: string | undefined;
}

export interface DirectiveNode extends Node {
    type: NodeTypes.DIRECTIVE;
    name: string;
    value: string | undefined;
}

export interface ElementNode extends Node {
    tag: string;
    props: Array<AttributeNode | DirectiveNode>;
    children?: Node[] | none;
    /**
     * 是否是自闭合标签
     * eg: <div />
     */
    isSelfClosing?: boolean;
}
