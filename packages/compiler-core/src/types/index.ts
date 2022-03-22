interface MergedParserOptions {
    
}

export interface ParserContext {
    options: MergedParserOptions;
    readonly originalSource: string;
    source: string;
    offset: number;
    line: number;
    column: number;
    inPre: boolean; // HTML <pre> tag, preserve whitespaces
    inVPre: boolean; // v-pre, do not process directives and interpolations
}
