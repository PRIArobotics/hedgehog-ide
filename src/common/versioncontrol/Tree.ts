import Blob from "./Blob";
import IProgramStorage from "./ProgramStorage";

export default class Tree {
    public id: string;
    public items: Map<string, TreeItem>;
    public programName: string;

    private storage: IProgramStorage;

    public constructor(storage, programName, id, items) {
        this.storage = storage;
        this.programName = programName;
        this.id = id;
        this.items = items;
    }

    public getTree(item: TreeItem): Promise<Tree> {
        return this.storage.getTree(this.programName, item.id);
    }

    public getBlob(item: TreeItem): Promise<Blob> {
        return this.storage.getBlob(this.programName, item.id);
    }

    public getItem(item: TreeItem): Promise<any> {
        if(item.type === TreeItemType.Blob) {
            return this.getBlob(item);
        } else {
            return this.getTree(item);
        }
    }
}

export enum TreeItemType {
    Blob,
    Tree
}

export class TreeItem {
    public type: TreeItemType;
    public id: string;
    public mode: number;

    constructor(type, id, mode) {
        this.type = type;
        this.id = id;
        this.mode = mode;
    }
}
