import Version from "./Version";
import Tree from "./Tree";
import WorkingTreeFile from "./WorkingTreeFile";
import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTree from "./WorkingTree";

export default class Program {
    public name: string;
    public latestVersionId: string;

    constructor(name, latestVersionId) {
        this.name = name;
        this.latestVersionId = latestVersionId;
    }

    public rename(newName: string): void {
        return undefined;
    }

    public getWorkingTree(): WorkingTree {
        return undefined;
    }

    public getVersions(): Version[] {
        return undefined;
    }

    public getVersion(versionId: string): Version {
        return undefined;
    }

    public getTree(treeId: string): Tree {
        return undefined;
    }

    public getBlob(blogId: string): Blob {
        return undefined;
    }

    public getWorkingTreeFile(path: string): WorkingTreeFile {
        return undefined;
    }

    public getWorkingTreeDirectory(path: string): WorkingTreeDirectory {
        return undefined;
    }
}
