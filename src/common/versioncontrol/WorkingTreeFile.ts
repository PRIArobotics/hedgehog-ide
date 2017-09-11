import {default as WorkingTreeObject, WorkingTreeObjectType} from "./WorkingTreeObject";

export default class WorkingTreeFile extends WorkingTreeObject {
    public readonly type = WorkingTreeObjectType.File;

    public size: number;

    public constructor(storage, programName, path, mode, size) {
        super(storage, programName);
        this.storage = storage;
        this.programName = programName;
        this.path = path;
        this.mode = mode;
        this.size = size;
    }

    public readContent(): Promise<string> {
        return this.storage.getWorkingTreeFileContent(this.programName, this.path);
    }

    public writeContent(content: string): Promise<void> {
        return this.storage.createOrUpdateWorkingTreeFile(this.programName, this.path, content);
    }

    public reload(): Promise<WorkingTreeFile> {
        return this.storage.getWorkingTreeFile(this.programName, this.path);
    }
}
