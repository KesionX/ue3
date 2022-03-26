/**
 * @markdown
 * # 解析器
 *
 */
import { ParserContext } from "./types";
import _ from "lodash";
import {
    AttributeNode,
    DirectiveNode,
    ElementNode,
    Node,
    NodeTypes,
    RootNode,
    SourceLocation,
    TextModes
} from "./types/common";

export const locStub: SourceLocation = {
    source: "",
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 }
};

/**
 *
 * @param content
 * @param options
 */
export function baseParse(content: string, options = {}) {
    const context = createParseContext(content, options);
}

export function parse(context: ParserContext, ancestors: ElementNode[]) {
    const children = parseChildren(context, ancestors);
    const rootNode: RootNode = {
        type: NodeTypes.ROOT,
        children
    };
    return rootNode;
}

export function parseChildren(
    context: ParserContext,
    ancestors: ElementNode[]
) {
    const nodes: Node[] = [];
    const { mode, source } = context;
    // if ()
    while (!isEnd(context, ancestors)) {
        let node: Node = null;
        if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
            if (mode === TextModes.DATA && source[0] === "<") {
                if (source[1] === "!" && source.startsWith("<!--")) {
                    // <!--
                } else if (
                    source[1] === "!" &&
                    source.startsWith("<![CDATA[")
                ) {
                    // CDATA
                } else if (source[1] === "/") {
                    // </
                } else if (/a-z/i.test(source[1])) {
                    // 标签
                    node = parseELement(context, ancestors);
                }
            } else if (source.startsWith("{{")) {
                // 解析插值
            }
        }

        if (!node) {
            // 空文本
        }
        nodes.push(node);
    }
    return nodes;
}

function parseELement(context: ParserContext, ancestors: ElementNode[]) {
    let element = parseTag(context);
    const start = context.offset;
    if (element.isSelfClosing) return element;

    if (element.tag === "textarea" || element.tag === "title") {
        context.mode = TextModes.RCDATA;
    } else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag)) {
        context.mode = TextModes.RAWTEXT;
    } else {
        context.mode = TextModes.DATA;
    }

    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();

    if (context.source.startsWith(`</${element.tag}`)) {
        const elementEnd = parseTag(context, true);
    } else {
        console.warn(`缺少${element.tag}闭合标签`);
    }

    return element;
}

function parseTag(context: ParserContext, end?: boolean) {
    let start = -1;
    if (!end) {
        start = context.offset;
    }
    let match = end
        ? /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source)
        : /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source);
    // TODO 匹配不一定是正确的
    const tag = match[1];
    advanceBy(context, tag.length);
    advanceSpaces(context);

    const props = parseAttributes(context);

    // > or />
    const isSelfClosing = context.source.startsWith("/>");
    advanceBy(context, isSelfClosing ? 2 : 1);

    const element: ElementNode = {
        tag,
        type: NodeTypes.ELEMENT,
        props,
        isSelfClosing,
        children: []
    };
    return element;
}

function createParseContext(content: string, options = {}): ParserContext {
    return Object.assign(
        {},
        {
            options,
            column: 1,
            line: 1,
            offset: 0,
            mode: TextModes.DATA,
            originalSource: content,
            source: content,
            inPre: false,
            inVPre: false
        }
    );
}

function isEnd(context: ParserContext, ancestors: ElementNode[]) {
    if (!context.source || !context.source.length) {
        return true;
    }
    // 处理 <div><span></div></span> 等情况
    for (let index = 0; index < ancestors.length; index++) {
        const parent = ancestors[index];
        if (parent && context.source.startsWith(`</${parent.tag}`)) {
            return true;
        }
    }
    return false;
}

function advanceBy(context: ParserContext, count: number) {
    const prevOffset = context.offset;
    context.source = context.source.slice(count);
    context.offset = context.offset + count;

    return {
        prevOffset,
        offset: context.offset
    };
}

function advanceSpaces(context: ParserContext) {
    const match = /^[\t\r\n\f]+/.exec(context.source);
    if (match) {
        return advanceBy(context, match[0].length);
    }
    return {
        prevOffset: context.offset,
        offset: context.offset
    };
}

function parseAttributes(context: ParserContext) {
    const props: Array<AttributeNode | DirectiveNode> = [];
    advanceSpaces(context);
    while (
        !context.source.startsWith(">") &&
        !context.source.startsWith("/>")
    ) {
        // name="name" :name="name" @name="" name='name'
        const match = /^[^\t\f\n\r />][^\t\f\n\r />=]*/.exec(context.source);
        if (!match) {
            break;
        }
        let startOffset = context.offset;
        let name = match[0];
        let value;
        let type = NodeTypes.ATTRIBUTE;
        advanceBy(context, name.length);
        let endOffset = context.offset;
        advanceSpaces(context);

        if (name.startsWith(":")) {
            // :name
            name = name.slice(1);
        } else if (name.startsWith("@")) {
            // @name
            name = name.slice(1);
            type = NodeTypes.DIRECTIVE;
        } else {
            // name
            if (!context.source.startsWith("=")) {
                value = true;
                advanceBy(context, 1);
            }
        }
        if (!value) {
            const quote = context.source[0];
            const isQuted = quote === '"' || quote === "'";
            if (isQuted) {
                advanceBy(context, 1);
                const nextQuoteIndex = context.source.indexOf(quote);
                if (nextQuoteIndex > -1) {
                    value = context.source.slice(0, nextQuoteIndex);
                    advanceBy(context, value.length);
                    advanceBy(context, 1);
                } else {
                    console.error("缺少引号");
                }
            } else {
                const match = /^[^\t\r\f\n >]+/.exec(context.source);
                value = match[0];
                advanceBy(context, value.length);
            }
            endOffset = context.offset;
        }
        advanceSpaces(context);

        let node: AttributeNode | DirectiveNode = {
            type: type,
            name,
            value,
            loc: {
                start: {
                    offset: startOffset
                },
                end: {
                    offset: endOffset
                },
                source: context.originalSource.substring(startOffset, endOffset);
            }
        };
        props.push(node);
    }
    return props;
}
