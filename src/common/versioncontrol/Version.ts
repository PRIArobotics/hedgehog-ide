import Tree from "./Tree";
import IProgramStorage from "./ProgramStorage";

export default class Version {
    public id: string;
    public tag: string;
    public message: string;
    public creationDate: Date;
    public programName: string;

    public parentIds: string[];
    public treeId: string;

    private storage: IProgramStorage;

    public constructor(storage, programName, id, tag, message, creationDate, parentIds, treeId) {
        this.storage = storage;
        this.programName = programName;
        this.id = id;
        this.tag = tag;
        this.message = message;
        this.creationDate = creationDate;
        this.parentIds = parentIds;
        this.treeId = treeId;
    }

    public getTree(): Promise<Tree> {
        return this.storage.getTree(this.programName, this.treeId);
    }

    public getParent(parentId): Promise<Version> {
        return this.storage.getVersion(this.programName, parentId);
    }
}
