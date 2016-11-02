import WorkingTreeFile from "./WorkingTreeFile";
export default class WorkingTreeDirectory {
    public path: string;
    public mode: string;

    public items: {[key: string]: DirectoryItem};

    public getName(): string {
        return undefined;
    }

    public getDirectory(item: DirectoryItem): WorkingTreeDirectory {
        return undefined;
    }

    public getFile(item: DirectoryItem): WorkingTreeFile {
        return undefined;
    }

    public getItem(item: DirectoryItem) {

    };

    public addFile(name: string, content: string, encoding?: string, mode?: string): WorkingTreeFile {
        return undefined;
    }

    public deleteFile(name: string) {

    }

    public addDirectory(name: string): WorkingTreeDirectory {
        return undefined;
    }

    public deleteDirectory(name: string) {

    }

    public reload() {

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
