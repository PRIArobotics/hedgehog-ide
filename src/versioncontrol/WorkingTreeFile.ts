import path = require('path');

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
        return path.basename(this.path);
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
