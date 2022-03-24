/**
 * @markdown
 * # 解析器
 *
 */
import { ParserContext } from "./types";
import _ from "lodash";
import {
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
    const element = parseTag(context);
    const start = context.offset;
    if (element.isSelfClosing) return element;

    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();

    if (context.source.startsWith(`</${element.tag}`)) {
        parseTag(context, true);
    } else {
        console.warn(`缺少${element.tag}闭合标签`);
    }

    return element;
}

function parseTag(context: ParserContext, end?: boolean) {
    // const start = context.offset;
    let match = end
        ? /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source)
        : /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source);
    // TODO 匹配不一定是正确的
    const tag = match[1];
    advanceBy(context, tag.length);
    advanceSpaces(context);
    const isSelfClosing = context.source.startsWith("/>");
    // > or />
    advanceBy(context, isSelfClosing ? 2 : 1);

    const element: ElementNode = {
        tag,
        type: NodeTypes.ELEMENT,
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
