import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTreeFile from "./WorkingTreeFile";
import Version from "./Version";
import IProgramStorage from "./ProgramStorage";

export default class WorkingTree {
    private programName;
    private storage: IProgramStorage;


    public constructor(storage, programName: string) {
        this.storage = storage;
        this.programName = programName;
    }

    public getRootDriectory(): WorkingTreeDirectory {
        return undefined;
    }

    public getDirectory(path: string): WorkingTreeDirectory {
        return undefined;
    }

    public getFile(path: string): WorkingTreeFile {
        return undefined;
    }

    public isClean(): boolean {
        return undefined;
    }

    public saveAsVersion(message: string, tag?: string): Version {
        return undefined;
    }
}
