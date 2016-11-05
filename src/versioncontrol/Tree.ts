import Blob from "./Blob";

export default class Tree {
    public id: string;
    public items: Map<string, TreeItem>;

    private programName: string;

    public constructor(programName, id, items) {
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
    public mode: string;

    constructor(type, id, mode) {
        this.type = type;
        this.id = id;
        this.mode = mode;
    }
}
