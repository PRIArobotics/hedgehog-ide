import {IProcess, default as IProcessManager} from "../../common/ProcessManager";

export default class SocketIoProcessAdapter {
    public constructor (private processManager: IProcessManager, private io: SocketIO.Server) {
        this.registerNewProcessHandler();
        this.registerStreamDataHandler('stdout');
        this.registerStreamDataHandler('stderr');
        this.registerProcessExitHandler();
    }

    private registerNewProcessHandler () {
        this.processManager.on('new', (process: IProcess) => {
            // Create a new process object here as we expect to get a NodeProcess
            // instance with additional properties here
            this.io.emit('process_new', {
                programName: process.programName,
                filePath: process.filePath,
                args: process.args,
                pid: process.pid
            });
        });
    }

    private registerStreamDataHandler (stream: string) {
        this.processManager.on('data_' + stream, (process: IProcess, data: string) => {
            this.io.emit('process_data_' + stream, process.pid, data.toString());
        });
    }

    private registerProcessExitHandler () {
        this.processManager.on('exit', (process: IProcess) => {
            this.io.emit('process_exit', process.pid);
        });
    }
}
