import Version from "./Version";
import Tree from "./Tree";
import WorkingTreeFile from "./WorkingTreeFile";
import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTree from "./WorkingTree";
import IProgramStorage from "./ProgramStorage";

export default class Program {
    public name: string;
    public latestVersionId: string;

    private storage: IProgramStorage;


    constructor(storage, name, latestVersionId) {
        this.storage = storage;
        this.name = name;
        this.latestVersionId = latestVersionId;
    }

    public async rename(newName: string): void {
        await this.storage.renameProgram(this.name, newName);
        this.name = newName;
    }

    public getWorkingTree(): WorkingTree {
        return this.storage.getWorkingTree(this.name);
    }

    public async getVersions(): Promise<Version[]> {
        let versions = [];
        for(const id of await this.storage.getVersionIds(this.name))
            versions.push(await this.storage.getVersion(this.name, id));

        return versions;
    }

    public getVersion(versionId: string): Promise<Version> {
        return this.storage.getVersion(this.name, versionId);
    }

    public getTree(treeId: string): Promise<Tree> {
        return this.storage.getTree(this.name, treeId);
    }

    public getBlob(blobId: string): Promise<Blob> {
        return this.storage.getBlob(this.name, blobId);
    }

    public getWorkingTreeFile(path: string): Promise<WorkingTreeFile> {
        return this.storage.getWorkingTreeFile(this.name, path);
    }

    public getWorkingTreeDirectory(path: string): Promise<WorkingTreeDirectory> {
        return this.storage.getWorkingTreeDirectory(this.name, path);
    }
}
