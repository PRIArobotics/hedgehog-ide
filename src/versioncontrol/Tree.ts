import Blob from "./Blob";
import IProgramStorage from "./ProgramStorage";

export default class Tree {
    public id: string;
    public items: Map<string, TreeItem>;

    private programName: string;
    private storage: IProgramStorage;

    public constructor(storage, programName, id, items) {
        this.storage = storage;
        this.programName = programName;
        this.id = id;
        this.items = items;
    }

    public getTree(item: TreeItem): Tree {
        return undefined;
    }

    public getBlob(item: TreeItem): Blob {
        return undefined;
    }

    public getItem(item: TreeItem): any {
        return undefined;
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
