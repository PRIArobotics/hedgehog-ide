export default class Blob {
    public id: string;
    public size: number;

    private programName: string;

    public constructor(programName, id, size) {
        this.programName = programName;
        this.id = id;
        this.size = size;
    }

    public readContent(): string {
        return undefined;
    }
}
