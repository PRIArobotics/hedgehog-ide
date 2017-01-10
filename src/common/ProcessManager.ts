interface IProcessManager {
    run (programName: string, filePath: string, args?: string[]): Promise<IProcess>;
    kill (pid: number): Promise<void>;

    getStdout (pid: number): Promise<string>;
    getStderr (pid: number): Promise<string>;
    writeStdin (pid: number, data: string): Promise<void>;

    getProcess (pid: number): Promise<IProcess>;
    on (event: string, handler: Function): void;
}
export default IProcessManager;

export interface IProcess {
    programName: string;
    filePath: string;
    args: string[];
    pid: number;
}
