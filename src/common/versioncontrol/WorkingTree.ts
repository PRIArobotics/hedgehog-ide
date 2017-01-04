import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTreeFile from "./WorkingTreeFile";
import IProgramStorage from "./ProgramStorage";

export default class WorkingTree {
    public readonly isClean: boolean;

    private programName;
    private storage: IProgramStorage;

    public constructor(storage, programName: string, isClean) {
        this.storage = storage;
        this.programName = programName;
        this.isClean = isClean;
    }

    public getRootDirectory(): Promise<WorkingTreeDirectory> {
        return this.getDirectory('.');
    }

    public getDirectory(path: string): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, path);
    }

    public getFile(path: string): Promise<WorkingTreeFile> {
        return this.storage.getWorkingTreeFile(this.programName, path);
    }

    public saveAsVersion(message: string, tag?: string): Promise<string> {
        return this.storage.createVersionFromWorkingTree(this.programName, message, tag);
    }
}
