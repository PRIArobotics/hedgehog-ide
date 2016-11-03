import WorkingTreeDirectory from "./WorkingTreeDirectory";
import WorkingTreeFile from "./WorkingTreeFile";
import Version from "./Version";

export default class WorkingTree {
    private programName;

    public constructor(programName: string) {
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
