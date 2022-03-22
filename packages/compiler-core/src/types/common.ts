export const enum NodeTypes {}

export interface Position {
    offset: number; // from start of file
    line: number;
    column: number;
}

export interface SourceLocation {
    start: Position;
    end: Position;
    source: string;
}

export interface Node {
    type: NodeTypes;
    loc: SourceLocation;
}
