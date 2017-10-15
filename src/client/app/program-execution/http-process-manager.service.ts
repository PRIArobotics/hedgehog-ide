import {Injectable, Inject} from "@angular/core";
import {DOCUMENT} from "@angular/platform-browser";
import io = require('socket.io-client');

import {default as IProcessManager , IProcess} from "../../../common/ProcessManager";
import {genericFromBase64, genericToBase64} from "../../../common/utils";
import EventEmitter from "./EventEmitter";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class HttpProcessManagerService implements IProcessManager {
    private static resourceToProcess (resource: any): IProcess {
        return {
            programName: genericFromBase64(resource.attributes.programId),
            filePath: resource.attributes.file,
            args: resource.attributes.args || [ ],
            pid: Number(resource.id)
        };
    }

    private eventEmitter = new EventEmitter();
    private io: SocketIOClient.Socket;

    public constructor (private http: HttpClient, @Inject(DOCUMENT) private document) {
        this.io = io(`${document.location.protocol}//${document.location.hostname}:${document.location.port}`);
        this.socketIoRegisterNewProcessHandler();
        this.socketIoRegisterStreamDataHandler('stdout');
        this.socketIoRegisterStreamDataHandler('stderr');
        this.socketIoRegisterProcessExitHandler();
    }

    public async run (programName: string, filePath: string, args: string[] = [ ]) {
        let response = (await this.http.post('/api/processes', {
            data: {
                type: 'process',
                attributes: {
                    programId: genericToBase64(programName),
                    fileId: genericToBase64(filePath),
                    args
                }
            }
        }).toPromise())['data'];

        return HttpProcessManagerService.resourceToProcess(response);
    }

    public async kill (pid: number) {
        await this.http.delete(`/api/processes/${pid}`).toPromise();
    }

    public async getStdout (pid: number): Promise<string> {
        return (await this.http.get(`/api/processes/${pid}/stdout`).toPromise()).toString();
    }

    public async getStderr (pid: number): Promise<string> {
        return (await this.http.get(`/api/processes/${pid}/stderr`).toPromise()).toString();
    }

    public async writeStdin (pid: number, data: string): Promise<void> {
        await this.http.patch(`/api/processes/${pid}/stdin`, data).toPromise();
    }

    public async getProcess (pid: number): Promise<IProcess> {
        let response = (await this.http.get(`/api/processes/${pid}`).toPromise())['data'];
        return HttpProcessManagerService.resourceToProcess(response);
    }

    public on (event: string, handler: Function) {
        this.eventEmitter.on(event, handler);
    }

    private socketIoRegisterNewProcessHandler () {
        this.io.on('process_new', (process: IProcess) => {
            this.eventEmitter.emit('new', process);
        });
    }

    private socketIoRegisterProcessExitHandler () {
        this.io.on('process_exit', (pid: number) => {
            this.eventEmitter.emit('exit', pid);
        });
    }

    private socketIoRegisterStreamDataHandler (stream: string) {
        this.io.on('process_data_' + stream, (pid: number, data: string) => {
            this.eventEmitter.emit(stream, pid, data);
        });
    }
}
