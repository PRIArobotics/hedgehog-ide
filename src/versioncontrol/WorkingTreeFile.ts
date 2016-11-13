import IWorkingTreeObject from "./WorkingTreeObject";
import {WorkingTreeObjectType} from "./WorkingTreeObject";
import IProgramStorage from "./ProgramStorage";

export default class WorkingTreeFile implements IWorkingTreeObject {
    public readonly type = WorkingTreeObjectType.File;

    public path: string;
    public mode: number;
    public size: number;

    private programName: string;
    private storage: IProgramStorage;

    public constructor(storage, programName, path, mode, size) {
        this.storage = storage;
        this.programName = programName;
        this.path = path;
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
