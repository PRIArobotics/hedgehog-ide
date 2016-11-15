import path = require('path');
import IProgramStorage from "./ProgramStorage";

export default WorkingTreeObject;

abstract class WorkingTreeObject {
    public readonly type: WorkingTreeObjectType;

    public path: string;
    public mode: number;

    protected programName: string;
    protected storage: IProgramStorage;

    public abstract reload(): Promise<WorkingTreeObject>;

    public getName(): string {
        return path.basename(this.path);
    }

    public rename(newName: string): Promise<void> {
        return this.storage.updateWorkingTreeObject(
            this.programName,
            this.path,
            {newName: path.join(this.path, newName)}
        );
    }

    public updateMode(mode: number): Promise<void> {
        return this.storage.updateWorkingTreeObject(this.programName, this.path, {mode});
    }
}

export enum WorkingTreeObjectType {
    Directory,
    File
}
