import IProgramStorage from "./ProgramStorage";

export default class Blob {
    public id: string;
    public size: number;
    public programName: string;

    private storage: IProgramStorage;

    public constructor(storage, programName, id, size) {
        this.storage = storage;
        this.programName = programName;
        this.id = id;
        this.size = size;
    }

    public readContent(): Promise<string> {
        return this.storage.getBlobContent(this.programName, this.id);
    }
}
