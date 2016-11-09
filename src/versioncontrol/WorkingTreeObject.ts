export default IWorkingTreeObject;

interface IWorkingTreeObject {
    readonly type: WorkingTreeObjectType;

    path: string;
    mode: number;

    reload(): void;
}

export enum WorkingTreeObjectType {
    Directory,
    File
}
