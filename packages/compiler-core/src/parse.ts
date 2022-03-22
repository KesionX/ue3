import { ParserContext } from "./types";
import { SourceLocation } from "./types/common";

export const locStub: SourceLocation = {
    source: "",
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 }
};

export function baseParse(content: string, options = {}) {
    const context = createParseContext(content, options);
}

export function parseChildren(context: ParserContext) {

    
}

function createParseContext(content: string, options = {}): ParserContext {
    return Object.assign(
        {},
        {
            options,
            column: 1,
            line: 1,
            offset: 0,
            originalSource: content,
            source: content,
            inPre: false,
            inVPre: false
        }
    );
}
