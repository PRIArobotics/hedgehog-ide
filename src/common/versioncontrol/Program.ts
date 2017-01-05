import Version from "./Version";
import Blob from "./Blob";
import Tree from "./Tree";
import WorkingTreeFile from "./WorkingTreeFile";
import WorkingTreeDirectory from "./WorkingTreeDirectory";
import IProgramStorage from "./ProgramStorage";

export default class Program {
    constructor(private storage: IProgramStorage,
                public name: string,
                public latestVersionId: string,
                public workingTreeClean: boolean) { }

    public async rename(newName: string): Promise<void> {
        await this.storage.renameProgram(this.name, newName);
        this.name = newName;
    }

    public async resetWorkingTree(): Promise<void> {
        await this.storage.resetWorkingTree(this.name);
        this.workingTreeClean = true;
    }

    public async reset(versionId: string): Promise<void> {
        await this.storage.resetProgram(this.name, versionId);
        this.latestVersionId = versionId;
    }

    public getVersionIds(): Promise<string[]> {
        return this.storage.getVersionIds(this.name);
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

    public getWorkingTreeRoot(): Promise<WorkingTreeDirectory> {
        return this.getWorkingTreeDirectory('.');
    }
}
