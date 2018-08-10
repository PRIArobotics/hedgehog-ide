import fs = require('fs');
import path = require('path');
import {ChildProcess, spawn} from "child_process";
import winston = require("winston");
import {EventEmitter} from "events";

import GitProgramStorage from "../versioncontrol/GitProgramStorage";
import {wrapCallbackAsPromise} from "../../common/utils";
import {IProcess, default as IProcessManager} from "../../common/ProcessManager";

export default class NodeProcessManager implements IProcessManager {
    private eventEmitter = new EventEmitter();

    private processes: Map<number, NodeProcess> = new Map();

    // GitProgramStorage is required here as we need the program to be physically stored on the system
    constructor (private processDir: string,
                 private pythonPath: string,
                 private storage: GitProgramStorage) { }

    public run (programName: string, filePath: string, args: string[] = []): Promise<NodeProcess> {
        let processArgs: string[];
        if(programName === null || filePath === null)
            processArgs = ['-u', ...args];
        else
            processArgs = ['-u', this.storage.getWorkingTreePath(programName, filePath), ...args];

        let process: NodeProcess = new NodeProcess(
            programName,
            filePath,
            args,
            spawn(this.pythonPath, processArgs)
        );

        this.processes.set(process.nodeProcess.pid, process);
        this.registerProcessExitHandler(process);
        this.registerRedirectOutputHandler(process, 'stdout');
        this.registerRedirectOutputHandler(process, 'stderr');
        this.registerErrorHandler(process);

        winston.debug(`Spawning process: ${programName} - ${filePath} ${args}`);
        this.eventEmitter.emit('new', process);

        return Promise.resolve(process);
    }

    public kill (pid: number): Promise<void> {
        this.processes.get(pid).nodeProcess.kill('SIGINT');
        return Promise.resolve();
    }

    public getStdout (pid: number): Promise<string> {
        return wrapCallbackAsPromise(fs.readFile, this.getStreamStorageFile(pid, 'stdout'));
    }

    public getStderr (pid: number): Promise<string> {
        return wrapCallbackAsPromise(fs.readFile, this.getStreamStorageFile(pid, 'stderr'));
    }

    public writeStdin (pid: number, data: string): Promise<void> {
        let process = this.processes.get(pid).nodeProcess;
        return wrapCallbackAsPromise(process.stdin.write.bind(process.stdin), data);
    }

    public getProcess (pid: number): Promise<NodeProcess> {
        return Promise.resolve(this.processes.get(pid));
    }

    public on (event: string, handler: (...args: any[]) => void) {
        this.eventEmitter.on(event, handler);
    }

    private registerProcessExitHandler(process: NodeProcess) {
        const pid = process.nodeProcess.pid;
        process.nodeProcess.on('exit', async () => {
            winston.debug(`Process exited: ${pid}`);
            this.eventEmitter.emit('exit', process);

            this.processes.delete(pid);

            try {
                await wrapCallbackAsPromise(fs.unlink, this.getStreamStorageFile(pid, 'stdout'));
            } catch (err) {
                if (err.code !== 'ENOENT')
                    winston.error(err);
            }

            try {
                await wrapCallbackAsPromise(fs.unlink, this.getStreamStorageFile(pid, 'stderr'));
            } catch (err) {
                if (err.code !== 'ENOENT')
                    winston.error(err);
            }
        });
    }

    private registerRedirectOutputHandler (process: NodeProcess, stream: string) {
        process.nodeProcess[stream].on('data', (data: string) => {
            this.eventEmitter.emit('data_' + stream, process, data);
            fs.appendFile(this.getStreamStorageFile(process.nodeProcess.pid, stream), data, err => {
                if (err)
                    winston.error(err.toString());
            });
        });
    }

    private registerErrorHandler (process: NodeProcess) {
        process.nodeProcess['stderr'].on('error', err => {
            this.eventEmitter.emit('error', process, err);
            winston.error(err.toString());
        });
    }

    private getStreamStorageFile(pid: number, stream: string) {
        return path.resolve(this.processDir, `${pid}.${stream}`);
    }
}

export class NodeProcess implements IProcess {
    public programName: string;
    public filePath: string;
    public args: string[];
    public pid: number;

    public nodeProcess: ChildProcess;

    public constructor(programName: string, filePath: string, args: string[], nodeProcess: ChildProcess) {
        this.programName = programName;
        this.filePath = filePath;
        this.args = args;
        this.pid = nodeProcess.pid;
        this.nodeProcess = nodeProcess;
    }
}

