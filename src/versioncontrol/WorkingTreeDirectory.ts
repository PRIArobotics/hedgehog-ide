import path = require('path');

import WorkingTreeFile from "./WorkingTreeFile";
import IWorkingTreeObject from "./WorkingTreeObject";
import {WorkingTreeObjectType} from "./WorkingTreeObject";
import IProgramStorage from "./ProgramStorage";

export default class WorkingTreeDirectory implements IWorkingTreeObject {
    public readonly type: WorkingTreeObjectType = WorkingTreeObjectType.Directory;

    public path: string;
    public mode: number;
    public items: string[];

    private programName: string;
    private storage: IProgramStorage;

    public constructor(storage, programName, path, mode, items) {
        this.storage = storage;
        this.programName = programName;
        this.path = path;
        this.mode = mode;
        this.items = items;
    }

    public getName(): string {
        return path.basename(this.path);
    }

    public getDirectory(itemName: string): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, this.getItemPath(itemName));
    }

    public getFile(itemName: string): Promise<WorkingTreeFile> {
        return this.storage.getWorkingTreeFile(this.programName, this.getItemPath(itemName));
    }

    public async getItem(itemName: string): Promise<IWorkingTreeObject> {
        try {
            return await this.getFile(itemName);
        } catch(err) {
            return this.getDirectory(itemName);
        }
    }

    public async addFile(name: string, content: string, mode?: number): Promise<void> {
        await this.storage.createOrUpdateWorkingTreeFile(this.programName, this.getItemPath(name), content, mode);
        this.items.push(name);
    }

    public async deleteFile(name: string): Promise<void> {
        await this.storage.deleteWorkingTreeObject(this.programName, this.getItemPath(name));
        this.items.splice(this.items.indexOf(name));
    }

    public async addDirectory(name: string, mode?: number): Promise<void> {
        await this.storage.createWorkingTreeDirectory(this.programName, this.getItemPath(name));
        this.items.push(name);
    }

    public deleteDirectory(name: string): Promise<void> {
        return this.deleteFile(name);
    }

    public getItemPath(item: string): string {
        return path.join(this.path, item);
    }

    public reload(): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, this.path);
    }
}
