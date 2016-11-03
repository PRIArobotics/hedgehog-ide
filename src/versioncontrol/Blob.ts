export default class Blob {
    public id: string;
    public encoding: string;
    public size: number;

    private programName: string;

    public constructor(programName, id, encoding, size) {
        this.programName = programName;
        this.id = id;
        this.encoding = encoding;
        this.size = size;
    }

    public readContent(): string {
        return undefined;
    }
}
