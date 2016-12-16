
import WorkingTreeFile from "./WorkingTreeFile";
import WorkingTreeObject from "./WorkingTreeObject";
import { WorkingTreeObjectType } from "./WorkingTreeObject";
import {join, basename} from "../utils";

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

    public getType(itemName: string) {
        return this.types[itemName];
    }

    public getDirectory(itemName: string): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.programName, this.getItemPath(itemName));
    }

    public getFile(itemName: string): Promise<WorkingTreeFile> {
        return this.storage.getWorkingTreeFile(this.programName, this.getItemPath(itemName));
    }

    public async getItem(itemName: string): Promise<WorkingTreeObject> {
        if(this.getType(itemName) === WorkingTreeObjectType.File) {
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

    public async deleteFile(name: string): Promise<void> {
        await this.storage.deleteWorkingTreeObject(this.programName, this.getItemPath(name));

        // only delete the item if it has not already been done by the program storage
        if(this.items.indexOf(name) !== -1) {
            this.items.splice(this.items.indexOf(name));
            this.types[name] = WorkingTreeObjectType.Directory;
        }
    }

    public async addDirectory(name: string, mode?: number): Promise<void> {
        await this.storage.createWorkingTreeDirectory(this.programName, this.getItemPath(name));

        // only add the new item if it has not already been done by the program storage
        if(this.items.indexOf(name) === -1) {
            this.items.push(name);
            delete this.types[name];
        }
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
