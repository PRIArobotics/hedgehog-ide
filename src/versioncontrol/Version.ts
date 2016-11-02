import Tree from "./Tree";
export default class Version {
    id: string;
    tag: string;
    message: string;
    creationDate: Date;

    parentIds: string[];
    treeIde: string;

    public getTree(): Tree {
        return undefined;
    }

    public getParent(parentId): Version {
        return undefined;
    }
}