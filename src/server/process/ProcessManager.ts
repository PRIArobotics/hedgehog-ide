import fs = require('fs');
import path = require('path');
import {ChildProcess, spawn} from "child_process";
import winston = require("winston");

import GitProgramStorage from "../versioncontrol/GitProgramStorage";
import {wrapCallbackAsPromise} from "../../common/utils";

export default class ProcessManager {
    private processes: Map<number, Process> = new Map();

    // GitProgramStorage is required here as we need the program to be physically stored on the system
    constructor(private processDir: string, private storage: GitProgramStorage) { }

    public run(programName: string, filePath: string, args: string[] = []): Process {
        let process: Process = new Process(
            programName,
            filePath,
            args,
            spawn(`python3`, [this.storage.getWorkingTreePath(programName, filePath), ...args])
        );
        this.processes.set(process.nodeProcess.pid, process);

        this.registerProcessExitHandler(process.nodeProcess);
        this.registerRedirectOutputHandler(process.nodeProcess, 'stdout');
        this.registerRedirectOutputHandler(process.nodeProcess, 'stderr');
        this.registerErrorHandler(process.nodeProcess);
        return process;
    }

    public kill(pid: number) {
        this.processes.get(pid).nodeProcess.kill();
    }

    public isAlive(pid: number) {
        return this.processes.has(pid);
    }

    public getStdout(pid: number): Promise<string> {
        return wrapCallbackAsPromise(fs.readFile, this.getStreamStorageFile(pid, 'stdout'));
    }

    public getStderr(pid: number): Promise<string> {
        return wrapCallbackAsPromise(fs.readFile, this.getStreamStorageFile(pid, 'stderr'));
    }

    public writeStdin(pid: number, data: string): Promise<void> {
        let process = this.processes.get(pid).nodeProcess;
        return wrapCallbackAsPromise(process.stdin.write.bind(process.stdin), data);
    }

    public getProcess(pid: number): Process {
        return this.processes.get(pid);
    }

    private registerProcessExitHandler(process: ChildProcess) {
        process.on('exit', () => {
            this.processes.delete(process.pid);
            // TODO: stop moters and servos here
        });
    }

    private registerRedirectOutputHandler (process: ChildProcess, stream: string) {
        process[stream].on('data', (data: string) => {
            fs.appendFile(this.getStreamStorageFile(process.pid, stream), data, (err: Object) => {
                if (err)
                    winston.error(err.toString());
            });
        });
    }

    private registerErrorHandler (process: ChildProcess) {
        process.on('error', (err) => {
            winston.error(err);
        });
    }

    private getStreamStorageFile(pid: number, stream: string) {
        return path.resolve(this.processDir, `${pid}.${stream}`);
    }
}

export class Process {
    public programName: string;
    public filePath: string;
    public args: string[];
    public nodeProcess: ChildProcess;

    public constructor(programName: string, filePath: string, args: string[], nodeProcess: ChildProcess) {
        this.programName = programName;
        this.filePath = filePath;
        this.args = args;
        this.nodeProcess = nodeProcess;
    }
}

