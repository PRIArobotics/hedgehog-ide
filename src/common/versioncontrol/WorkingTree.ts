import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTreeFile from "./WorkingTreeFile";
import IProgramStorage from "./ProgramStorage";

export default class WorkingTree {
    private programName;
    private storage: IProgramStorage;


    public constructor(storage, programName: string) {
        this.storage = storage;
        this.programName = programName;
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

    // TODO: check whether this method is needed
    public isClean(): boolean {
        return undefined;
    }

    public saveAsVersion(message: string, tag?: string): Promise<string> {
        return this.storage.createVersionFromWorkingTree(this.programName, message, tag);
    }
}
