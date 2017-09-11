import WorkingTreeFile from "./WorkingTreeFile";
import {default as WorkingTreeObject, WorkingTreeObjectType} from "./WorkingTreeObject";
import {join} from "../utils";

export default class WorkingTreeDirectory extends WorkingTreeObject {
    public readonly type: WorkingTreeObjectType = WorkingTreeObjectType.Directory;

    public items: string[];

    private types: {[name: string]: WorkingTreeObjectType};

    public constructor(storage, programName, path, mode, items, types) {
        super(storage, programName);
        this.storage = storage;
        this.programName = programName;
        this.path = path;
        this.mode = mode;
        this.items = items;
        this.types = types;
    }

    public getItemType(itemName: string) {
        return this.types[itemName];
    }

    public getDirectory(itemName: string): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, this.getItemPath(itemName));
    }

    public getFile(itemName: string): Promise<WorkingTreeFile> {
        return this.storage.getWorkingTreeFile(this.programName, this.getItemPath(itemName));
    }

    public async getItem(itemName: string): Promise<WorkingTreeObject> {
        if(this.getItemType(itemName) === WorkingTreeObjectType.File) {
            return this.getFile(itemName);
        } else {
            return this.getDirectory(itemName);
        }
    }

    public async addFile(name: string, content: string, mode?: number): Promise<void> {
        await this.storage.createOrUpdateWorkingTreeFile(this.programName, this.getItemPath(name), content, mode);

        // only add the new item if it has not already been done by the program storage
        if(this.items.indexOf(name) === -1) {
            this.items.push(name);
            this.types[name] = WorkingTreeObjectType.File;
        }
    }

    public async deleteFile(name: string, directory: boolean = false): Promise<void> {
        await this.storage.deleteWorkingTreeObject(this.programName, this.getItemPath(name), directory);

        // only delete the item if it has not already been done by the program storage
        if(this.items.indexOf(name) !== -1) {
            this.items.splice(this.items.indexOf(name));
            delete this.types[name];
        }
    }

    public async addDirectory(name: string, mode?: number): Promise<void> {
        await this.storage.createWorkingTreeDirectory(this.programName, this.getItemPath(name));

        // only add the new item if it has not already been done by the program storage
        if(this.items.indexOf(name) === -1) {
            this.items.push(name);
            this.types[name] = WorkingTreeObjectType.Directory;
        }
    }

    public deleteDirectory(name: string): Promise<void> {
        return this.deleteFile(name, true);
    }

    public getItemPath(item: string): string {
        return join(this.path, item);
    }

    public reload(): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, this.path);
    }

    public rename(newName: string, isAbsolute = false, directory = false): Promise<void> {
        return super.rename(newName, isAbsolute, directory);
    }
}
