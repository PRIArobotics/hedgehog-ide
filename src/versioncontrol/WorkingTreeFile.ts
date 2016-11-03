export default class WorkingTreeFile {
    public path: string;
    public encoding: string;
    public mode: string;
    public size: number;

    private programName: string;

    public constructor(programName, path, encoding, mode, size) {
        this.programName = programName;
        this.path = path;
        this.encoding = encoding;
        this.mode = mode;
        this.size = size;
    }

    public getName(): string {
        return undefined;
    }

    public readContent(): string {
        return undefined;
    }

    public writeContent(content: string): void {
        return undefined;
    }

    public reload(): void {
        return undefined;
    }
}
