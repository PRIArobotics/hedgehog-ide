export default IWorkingTreeObject;

interface IWorkingTreeObject {
    readonly type: WorkingTreeObjectType;

    path: string;
    mode: number;

    reload(): Promise<IWorkingTreeObject>;
}

export enum WorkingTreeObjectType {
    Directory,
    File
}
