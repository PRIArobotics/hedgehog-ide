import ProcessManager from "./ProcessManager";
import {Process} from "./ProcessManager";

export default class SocketIoProcessAdapter {
    public constructor (private processManager: ProcessManager, private io: SocketIO.Server) {
        this.registerNewProcessHandler();
        this.registerStreamDataHandler('stdout');
        this.registerStreamDataHandler('stderr');
    }

    private registerNewProcessHandler () {
        this.processManager.on('new', (process: Process) => {
            this.io.emit('process_new', process.nodeProcess.pid);
        });
    }

    private registerStreamDataHandler (stream: string) {
        this.processManager.on('data_' + stream, (process: Process, data: string) => {
            this.io.emit('process_data_' + stream, process.nodeProcess.pid, data.toString());
        });
    }
}
