import Tree from "./Tree";
import IProgramStorage from "./ProgramStorage";

export default class Version {
    public id: string;
    public tag: string;
    public message: string;
    public creationDate: Date;

    public parentIds: string[];
    public treeId: string;

    private programName: string;
    private storage: IProgramStorage;

    public constructor(storage, programName, id, tag, message, creationDate, parentIds, treeId) {
        this.storage = storage
        this.programName = programName;
        this.id = id;
        this.tag = tag;
        this.message = message;
        this.creationDate = creationDate;
        this.parentIds = parentIds;
        this.treeId = treeId;
    }

    public getTree(): Tree {
        return undefined;
    }

    public getParent(parentId): Version {
        return undefined;
    }
}
