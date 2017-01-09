interface IProcessManager {
    run (programName: string, filePath: string, args?: string[]);
    kill (pid: number);
    isAlive (pid: number);

    getStdout (pid: number): Promise<string>;
    getStderr (pid: number): Promise<string>;
    writeStdin (pid: number, data: string): Promise<void>;

    getProcess(pid: number): IProcess;
    on (event: string, handler: Function);
    registerProcessExitHandler (process: IProcess);
}
export default IProcessManager;

export interface IProcess {
    programName: string;
    filePath: string;
    args: string[];
    pid: number;
}
