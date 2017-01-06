import fs = require('fs');
import path = require('path');
import {ChildProcess, spawn} from "child_process";
import winston = require("winston");

import GitProgramStorage from "../versioncontrol/GitProgramStorage";

export default class ProcessManager {
    private processes: Map<number, ChildProcess> = new Map();

    // GitProgramStorage is required here as we need the program to be physically stored on the system
    constructor(private processDir: string, private storage: GitProgramStorage) { }

    public run(programName: string, filePath: string, args: string[] = []): number {
        args.unshift(this.storage.getWorkingTreePath(programName, filePath));
        let process = spawn(`python`, args);
        this.processes.set(process.pid, process);
        this.registerProcessExitHandler(process);
        this.registerRedirectOutputHandler(process, 'stdout');
        this.registerRedirectOutputHandler(process, 'stderr');
        return process.pid;
    }

    public kill(pid: number) {
        this.processes.get(pid).kill();
    }

    public isAlive(pid: number) {
        return this.processes.has(pid);
    }

    private registerProcessExitHandler(process: ChildProcess) {
        process.on('exit', () => {
            this.processes.delete(process.pid);
            // TODO: stop moters and servos here
        });
    }

    private registerRedirectOutputHandler(process: ChildProcess, stream) {
        process[stream].on('data', (data: string) => {
            fs.appendFile(path.resolve(this.processDir, `${process.pid}.${stream}`), data, (err: Object) => {
                if (err)
                    winston.error(err.toString());
            });
        });
    }
}