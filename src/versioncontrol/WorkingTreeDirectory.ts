import WorkingTreeFile from "./WorkingTreeFile";
export default class WorkingTreeDirectory {
    public path: string;
    public mode: string;

    public items: {[key: string]: DirectoryItem};

    private programName: string;

    public constructor(programName, path, mode, items) {
        this.programName = programName;
        this.path = path;
        this.mode = mode;
        this.items = items;
    }

    public getName(): string {
        return undefined;
    }

    public getDirectory(item: DirectoryItem): WorkingTreeDirectory {
        return undefined;
    }

    public getFile(item: DirectoryItem): WorkingTreeFile {
        return undefined;
    }

    public getItem(item: DirectoryItem): any {
        return undefined;
    };

    public addFile(name: string, content: string, encoding?: string, mode?: string): WorkingTreeFile {
        return undefined;
    }

    public deleteFile(name: string): void {
        return undefined;
    }

    public addDirectory(name: string): WorkingTreeDirectory {
        return undefined;
    }

    public deleteDirectory(name: string): void {
        return undefined;
    }

    public reload(): void {
        return undefined;
    }
}

export enum DirectoryItemType {
    File,
    Directory
}

export class DirectoryItem {
    public type: DirectoryItemType;
    public path: string;
    public mode: string;
}
