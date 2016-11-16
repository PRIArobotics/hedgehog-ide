
import WorkingTreeFile from "./WorkingTreeFile";
import WorkingTreeObject from "./WorkingTreeObject";
import { WorkingTreeObjectType } from "./WorkingTreeObject";
import { join } from "../utils";

export default class WorkingTreeDirectory extends WorkingTreeObject {
    public readonly type: WorkingTreeObjectType = WorkingTreeObjectType.Directory;

    public items: string[];

    public constructor(storage, programName, path, mode, items) {
        super(storage, programName);
        this.storage = storage;
        this.programName = programName;
        this.path = path;
        this.mode = mode;
        this.items = items;
    }

    public getDirectory(itemName: string): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, this.getItemPath(itemName));
    }

    public getFile(itemName: string): Promise<WorkingTreeFile> {
        return this.storage.getWorkingTreeFile(this.programName, this.getItemPath(itemName));
    }

    public async getItem(itemName: string): Promise<WorkingTreeObject> {
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
        return join(this.path, item);
    }

    public reload(): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, this.path);
    }
}
