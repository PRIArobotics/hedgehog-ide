import IProgramStorage from "./ProgramStorage";
import Program from "./Program";
import Tree = NodeGit.Tree;
import Version from "./Version";
import WorkingTree from "./WorkingTree";
import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTreeFile from "./WorkingTreeFile";

export default class DummyProgramStorage implements IProgramStorage {
    private programs: Map<string, Program>;
    private programVersions: Map<string, Map<string, Version>>;
    private programBlobs: Map<string, Map<string, Blob>>;
    private programBlobContents: Map<string, Map<string, string>>;
    private programTrees: Map<string, Map<string, Tree>>;
    private workingTreeDirectories: Map<string, Map<string, WorkingTreeDirectory>>;
    private workingTreeFiles: Map<string, Map<string, WorkingTreeFile>>;
    private workingTreeFileContents: Map<string, Map<string, string>>;

    public constructor() {
        this.programs = new Map<string, Program>();
        this.programVersions = new Map<string, Map<string, Version>>();
        this.programBlobs = new Map<string, Map<string, Blob>>();
        this.programBlobContents = new Map<string, Map<string, string>>();
        this.programTrees = new Map<string, Map<string, Tree>>();
        this.workingTreeDirectories = new Map<string, Map<string, WorkingTreeDirectory>>();
        this.workingTreeFiles = new Map<string, Map<string, WorkingTreeFile>>();
        this.workingTreeFileContents = new Map<string, Map<string, string>>();
    }

    public createProgram(name: string): Promise<Program> {
        let program = new Program(this, name, null);
        this.programs.set(name, program);
        return Promise.resolve(program);
    }

    public deleteProgram(name: string): Promise<void> {
        this.programs.delete(name);
        return Promise.resolve();
    }

    public getProgramNames(): Promise<string[]> {
        let names = [];
        for(let name of this.programs.keys())
            names.push(name);

        return Promise.resolve(names);
    }

    public getProgram(name: string): Promise<Program> {
        return Promise.resolve(this.programs.get(name));
    }

    public renameProgram(oldName: string, newName: string): Promise<void> {
        this.programs.set(newName, this.programs.get(oldName));
        this.programs.delete(oldName);
        return Promise.resolve();
    }

    public resetProgram(programName: string, versionId: string): Promise<void> {
        return undefined;
    }

    public getBlob(programName: string, blobId: string): Promise<Blob> {
        return Promise.resolve(this.programBlobs.get(programName).get(blobId));
    }

    public getBlobContent(programName: string, blobId: string, encoding?: string): Promise<string> {
        if(encoding !== 'utf-8')
            throw new Error('not supported');

        return Promise.resolve(this.programBlobContents.get(programName).get(blobId));
    }

    public getTree(programName: string, treeId: string): Promise<Tree> {
        return Promise.resolve(this.programTrees.get(programName).get(treeId));
    }

    public getVersionIds(programName: string): Promise<string[]> {
        let versionIds = [];
        for(let id of this.programVersions.get(programName).keys())
            versionIds.push(id);
        return undefined;
    }

    public getVersion(programName: string, versionId: string): Promise<Version> {
        return Promise.resolve(this.programVersions.get(programName).get(versionId));
    }

    // TODO
    public createVersionFromWorkingTree(programName: string, message: string, tag?: string): Promise<string> {
        return undefined;
    }

    public getWorkingTree(programName: string): WorkingTree {
        return new WorkingTree(this, programName);
    }

    // TODO
    public getWorkingTreeDirectory(programName: string, path: string): Promise<WorkingTreeDirectory> {
        return undefined;
    }

    // TODO
    public getWorkingTreeFile(programName: string, path: string): Promise<WorkingTreeFile> {
        return undefined;
    }

    // TODO
    public getWorkingTreeFileContent(programName: string, path: string, encoding?: string): Promise<string> {
        return undefined;
    }

    public createWorkingTreeDirectory(programName: string, path: string, mode?: number): void {
        mode = mode || 0o40755;
        let directory = new WorkingTreeDirectory(this, programName, path, mode, []);
        this.workingTreeDirectories.get(programName).set(path, directory);
    }

    public createWorkingTreeFile(programName: string, path: string, content: string, mode?: number): void {
        mode = mode || 0o100644;
        let file = new WorkingTreeFile(this, programName, path, mode, content.length);
        this.workingTreeFiles.get(programName).set(path, file);
        this.workingTreeFileContents.get(programName).set(path, content);
    }

    public updateWorkingTreeObject(programName: string,
                                   currentPath: string,
                                   options: {mode?: number; newPath?: string}): void {
        let objectMap;
        if(this.workingTreeFiles.get(programName).has(currentPath)) {
            objectMap = this.workingTreeFiles.get(programName);
        } else {
            objectMap = this.workingTreeDirectories.get(programName);
        }
        let object = objectMap.get(currentPath);

        if(options.mode)
            object.mode = options.mode;

        if(options.newPath) {
            object.path = options.newPath;
            objectMap.delete(currentPath);
            objectMap.set(options.newPath, object);
        }
    }

    public deleteWorkingTreeObject(programName: string, objectPath: string): void {
        if(this.workingTreeFiles.get(programName).has(objectPath)) {
            this.workingTreeFiles.get(programName).delete(objectPath);
        } else {
            let directory = this.workingTreeDirectories.get(programName).get(objectPath);
            for(const item of directory.items) {
                this.deleteWorkingTreeObject(programName, item);
            }
        }
    }

    public resetWorkingTree(programName: string) {
        return undefined;
    }

}
