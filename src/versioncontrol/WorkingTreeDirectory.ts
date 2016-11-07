import WorkingTreeFile from "./WorkingTreeFile";
import IWorkingTreeObject from "./WorkingTreeObject";
import {WorkingTreeObjectType} from "./WorkingTreeObject";

export default class WorkingTreeDirectory implements IWorkingTreeObject {
    public readonly type: WorkingTreeObjectType = WorkingTreeObjectType.Directory;

    public path: string;
    public mode: number;
    public items: string[];

    private programName: string;

    public constructor(programName, path, mode, items) {
        this.programName = programName;
        this.path = path;
        this.mode = mode;
        this.items = items;
    }

    public getName(): string {
        return undefined;
    }

    public getDirectory(itemPath: string): WorkingTreeDirectory {
        return undefined;
    }

    public getFile(itemPath: string): WorkingTreeFile {
        return undefined;
    }

    public getItem(itemPath: string): IWorkingTreeObject {
        return undefined;
    }

    public addFile(name: string, content: string, encoding?: string, mode?: string): WorkingTreeFile {
        return undefined;
    }

    public deleteFile(itemPath: string): void {
        return undefined;
    }

    public addDirectory(name: string): WorkingTreeDirectory {
        return undefined;
    }

    public deleteDirectory(itemPath: string): void {
        return undefined;
    }

    public reload(): void {
        return undefined;
    }
}
