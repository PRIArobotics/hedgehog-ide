import Version from "./Version";
import Tree from "./Tree";
import WorkingTreeFile from "./WorkingTreeFile";
import WorkingTreeDirectory from "./WorkingTreeDirectory";
export default class Program {
    public name: string;
    public latestVersionId: string;

    constructor(name) {
        this.name = name;
    }

    public rename(newName: string) {

    }

    public getWorkingTree() {

    }

    public getVersions() {

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
