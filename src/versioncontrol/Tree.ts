import Blob from "./Blob";
export default class Tree {
    public id: string;
    public items: {[key: string]: TreeItem};

    public getTree(item: TreeItem): Tree {
        return undefined;
    }

    public getBlob(item: TreeItem): Blob {
        return undefined;
    }

    public getItem(item: TreeItem) {

    }
}

export enum TreeItemType {
    Blob,
    Tree
}

export class TreeItem {
    type: TreeItemType;
    id: string;
    mode: string;
}