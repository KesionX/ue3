/**
 * @markdown
 * # 解析器
 *
 */
import { ParserContext } from "./types";
import _ from "lodash";
import {
    AttributeNode,
    CommentNode,
    DirectiveNode,
    ElementNode,
    InterpolationNode,
    Node,
    NodeTypes,
    RootNode,
    SourceLocation,
    TextModes,
    TextNode,
} from "./types/common";

export const locStub: SourceLocation = {
    source: "",
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 },
};

/**
 *
 * @param content
 * @param options
 */
export function baseParse(content: string, options = {}) {
    const context = createParseContext(content, options);
    const ast = parse(context);
    return ast;
}

export function parse(context: ParserContext) {
    const children = parseChildren(context, []);
    const rootNode: RootNode = {
        type: NodeTypes.ROOT,
        children,
    };
    return rootNode;
}

export function parseChildren(
    context: ParserContext,
    ancestors: ElementNode[]
) {
    const nodes: Node[] = [];
    const { mode, source } = context;
    console.log("@@@@@@@mode, source", mode, source);
    while (!isEnd(context, ancestors)) {
        let node: Node | null = null;
        if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
            if (mode === TextModes.DATA && source[0] === "<") {
                if (source[1] === "!" && source.startsWith("<!--")) {
                    parseComment(context);
                } else if (
                    source[1] === "!" &&
                    source.startsWith("<![CDATA[")
                ) {
                    // <!--
                } else if (source[1] === "/") {
                    // CDATA
                } else if (/[a-z]/i.test(source[1])) {
                    // 标签
                    console.log("标签解析");
                    node = parseELement(context, ancestors);
                }
            } else if (source.startsWith("{{")) {
                // 解析插值
                node = parseInterpolation(context);
            }
        }
        advanceSpaces(context);
        if (!node) {
            // 空文本
            node = parseText(context);
        }
        node && nodes.push(node);
    }
    return nodes;
}

/**
 * 解析 <xxx xx xx=xx :xx="xx" @xx="xxx"></xxx>
 * @param context
 * @param ancestors
 */
function parseELement(context: ParserContext, ancestors: ElementNode[]) {
    advanceSpaces(context);
    const startOffset = context.offset;
    let element = parseTag(context);
    console.log("element", element);
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
        parseTag(context, true);
        const endOffset = context.offset;
        element.loc = createLoc(context, startOffset, endOffset);
    } else {
        console.warn(`缺少${element.tag}闭合标签`);
    }
    console.log("------ return", element);
    return element;
}

/**
 * 解析标签1: <xxx xx xx=xx :xx="xx" @xx="xxx">
 * 解析标签2: <xxx xx xx=xx :xx="xx" @xx="xxx"/>
 * 解析标签3: </xx> </xx   >
 * @param context
 * @param end
 */
function parseTag(context: ParserContext, end?: boolean) {
    let startOffset = -1;
    console.log("pre", context.source);
    advanceSpaces(context);
    if (!end) {
        startOffset = context.offset;
    }
    let match = end
        ? /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source)
        : /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source);
    if (!match || match?.length < 2) {
        throw new Error("没有匹配到tag:" + context.source + end);
    }
    // tag=xxx
    const tag = match[1];
    // match[0] = <xxx 或  match[0] = </xxx
    advanceBy(context, match[0].length);
    advanceSpaces(context);

    let props = !end ? parseAttributes(context) : [];

    // > or />
    const isSelfClosing = context.source.startsWith("/>");
    advanceBy(context, isSelfClosing ? 2 : 1);

    const element: ElementNode = {
        tag,
        type: NodeTypes.ELEMENT,
        props,
        isSelfClosing,
        children: [],
    };
    // 如果是自闭 />
    if (isSelfClosing) {
        const endOffset = context.offset;
        element.loc = createLoc(context, startOffset, endOffset);
    }
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
            inVPre: false,
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
        console.log("------ is end:", parent.tag, context.source);
        if (parent && context.source.startsWith(`</${parent.tag}`)) {
            console.log("+++++===+=+ is end:", parent.tag, context.source);
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
        offset: context.offset,
    };
}

function createLoc(
    context: ParserContext,
    startOffset: number,
    endOffset: number
) {
    return {
        start: {
            offset: startOffset,
        },
        end: {
            offset: context.offset,
        },
        source: context.originalSource.substring(startOffset, endOffset),
    };
}

function advanceSpaces(context: ParserContext) {
    const match = /^[\t\r\n\f ]+/.exec(context.source);
    if (match) {
        return advanceBy(context, match[0].length);
    }
    return {
        prevOffset: context.offset,
        offset: context.offset,
    };
}

/**
 * 解析1： name=ss name="sss" :name="sss" @name="sss"  >  剩余:>
 * 解析2： name=ss name="sss" :name="sss" @name="sss"  /> 剩余:/>
 * @param context
 */
function parseAttributes(context: ParserContext) {
    console.log("parseAttributes:", context.source);
    const props: Array<AttributeNode | DirectiveNode> = [];
    advanceSpaces(context);
    console.log("parseAttributes space laster:", context.source);
    while (
        !context.source.startsWith(">") &&
        !context.source.startsWith("/>")
    ) {
        // name="name" :name="name" @name="" name='name'
        const match = /^[^\t\f\n\r />][^\t\f\n\r />=]*/.exec(context.source);

        if (!match) {
            throw new Error("无法匹配");
            // break;
        }
        let startOffset = context.offset;
        let name = match[0];
        console.log("+++ Attribute:", context.source, name);
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
        }

        if (!context.source.startsWith("=")) {
            // name
            value = true;
        } else {
            // name=xxx
            advanceBy(context, 1);
        }

        console.log("+++ Attribute step 2: ", context.source);
        if (!value) {
            // ="" 或 ='' 情况
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
                    // console.error("缺少引号");
                    throw new Error(name + "：缺少引号");
                }
            } else {
                // name=xxxx情况
                const match = /^[^\t\r\f\n >]+/.exec(context.source);
                if (match) {
                    value = match[0];
                    advanceBy(context, value.length);
                }
            }
            endOffset = context.offset;
        }
        advanceSpaces(context);

        let node: AttributeNode | DirectiveNode = {
            type: type,
            name,
            value,
            loc: createLoc(context, startOffset, endOffset),
        };
        props.push(node);
    }
    return props;
}

function parseText(context: ParserContext) {
    const { source } = context;
    let startOffset = context.offset;
    let endIndex = source.length;
    const ltIndex = source.indexOf("<");
    const delimiterIndex = source.indexOf("{{");

    if (ltIndex > -1 && ltIndex < endIndex) {
        endIndex = ltIndex;
    }
    if (delimiterIndex > -1 && delimiterIndex < endIndex) {
        endIndex = delimiterIndex;
    }

    const content = source.slice(0, endIndex);
    advanceBy(context, content.length);
    const node: TextNode = {
        type: NodeTypes.TEXT,
        content,
        loc: createLoc(context, startOffset, context.offset),
    };
    return node;
}

const namedCharacterReferences: Record<string, string> = {
    gt: ">",
    "gt;": ">",
    lt: "<",
    "lt;": "<",
    "ltcc;": "<",
};

/**
 * html字符解析
 * 1. 字符命令
 * 2. 数字字符
 * 3. 普通字符
 * @param context
 * @param asAttr
 * @returns
 */
function decodeHtml(context: ParserContext, asAttr = false) {
    let offset = 0;
    // const rawText = context.source;
    const end = context.source.length;
    let decodedText = "";
    let maxCRNameLength = 0;

    function advance(length: number) {
        advanceBy(context, length);
        offset += length;
    }

    while (offset < end) {
        // head[0] === '&', 命名字符引用
        // head[0] === '&#'，数字字符引用
        // head[0] === '&#x'，数字字符引用
        const head = /&(?:#x?)?/i.exec(context.source);
        if (!head) {
            const remaining = end - offset;
            decodedText += context.source.slice(0, remaining);
            advance(remaining);
            break;
        }
        // aaa &#xxxx => &#xxx
        decodedText += context.source.slice(0, head.index);
        advance(head.index);

        if (head[0] === "&") {
            let name = "";
            let value;
            // 命名字符引用
            if (/[0-9a-z]/i.test(context.source[1])) {
                if (!maxCRNameLength) {
                    maxCRNameLength = Object.keys(
                        namedCharacterReferences
                    ).reduce((max, name) => {
                        return Math.max(max, name.length);
                    }, 0);
                }

                for (
                    let length = maxCRNameLength;
                    !value && length > 0;
                    length--
                ) {
                    name = context.source.substring(1, length);
                    value = namedCharacterReferences[name];
                }

                if (value) {
                    const semi = name.endsWith(";");
                    if (
                        asAttr &&
                        !semi &&
                        /[=a-z0-9]/i.test(context.source[name.length + 1] || "")
                    ) {
                        decodedText += "&" + name;
                        advance(1 + name.length);
                    } else {
                        decodedText += value;
                        advance(1 + name.length);
                    }
                } else {
                    decodedText += "&" + name;
                    advance(1 + name.length);
                }
            } else {
                // 普通文本
                decodedText += "&";
                advance(1);
            }
        }
    }

    return decodedText;
}

function parseInterpolation(context: ParserContext) {
    advanceSpaces(context);
    const startOffset = context.offset;
    advanceBy(context, "{{".length);
    const closeIndex = context.source.indexOf("}}");
    if (closeIndex < 0) {
        throw new Error("parseInterpolation 缺少结束符");
    }

    const content = context.source.slice(0, closeIndex);
    const expressionStartOffset = context.offset;
    advanceBy(context, content.length);
    advanceSpaces(context);
    const expressionEndOffset = context.offset;
    advanceBy(context, "}}".length);

    const node: InterpolationNode = {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content,
            loc: createLoc(context, expressionStartOffset, expressionEndOffset),
        },
        loc: createLoc(context, startOffset, context.offset),
    };

    return node;
}

function parseComment(context: ParserContext) {
    advanceSpaces(context);
    const startOffset = context.offset;
    advanceBy(context, "<!--".length);
    const endIndex = context.source.indexOf("-->");
    const content = context.source.substring(0, endIndex);
    advanceBy(context, content.length);
    advanceSpaces(context);
    advanceBy(context, "-->".length);

    const node: CommentNode = {
        type: NodeTypes.COMMENT,
        content,
        loc: createLoc(context, startOffset, context.offset),
    };
    return node;
}
