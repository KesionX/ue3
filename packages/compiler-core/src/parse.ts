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

export function parse(context: ParserContext, ancestors) {
    const children = parseChildren(context, ancestors);
    const rootNode: RootNode = {
        type: NodeTypes.ROOT,
        children
    };
    return rootNode;
}

export function parseChildren(context: ParserContext, ancestors) {
    const nodes: Node[] = [];
    const { mode, source } = context;
    // if ()
    while (!isEnd(context)) {
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

function parseELement(context: ParserContext, ancestors) {
    const element = parseTag(context, ancestors);
    element.children = parseChildren(context, ancestors);
    parseTagEnd(context, ancestors);

    return element;
}

function parseTag(context: ParserContext, ancestors: any) {
    const tag: ElementNode = {
        type: NodeTypes.ELEMENT
    };
    return tag;
}

function parseTagEnd(context: ParserContext, ancestors: any) {}

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

function isEnd(context: ParserContext, ancestors: any[]) {
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
