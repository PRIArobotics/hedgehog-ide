import {basename, dirname, join} from "../utils";
import IProgramStorage from "./ProgramStorage";

abstract class WorkingTreeObject {
    public readonly type: WorkingTreeObjectType;

    public path: string;
    public mode: number;
    public programName: string;

    protected storage: IProgramStorage;

    protected constructor(storage, programName) {
        this.storage = storage;
        this.programName = programName;
    }

    public abstract reload(): Promise<WorkingTreeObject>;

    public getName(): string {
        return basename(this.path);
    }

    public getParentPath(): string {
        return dirname(this.path);
    }

    public rename(newName: string, isAbsolute = false, directory = false): Promise<void> {
        return this.storage.updateWorkingTreeObject(
            this.programName,
            this.path,
            {
                newPath: isAbsolute ? newName : join(this.getParentPath(), newName),
                directory
            }
        );
    }

    public updateMode(mode: number): Promise<void> {
        return this.storage.updateWorkingTreeObject(this.programName, this.path, {mode});
    }
}

export default WorkingTreeObject;

export enum WorkingTreeObjectType {
    Directory,
    File
}
