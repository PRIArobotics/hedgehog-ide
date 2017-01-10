import {Http} from "@angular/http";
import {Injectable, Inject} from "@angular/core";
import {DOCUMENT} from "@angular/platform-browser";
import io = require('socket.io-client');

import IProcessManager from "../../../common/ProcessManager";
import {IProcess} from "../../../common/ProcessManager";
import {genericFromBase64, genericToBase64} from "../../../common/utils";
import EventEmitter from "./EventEmitter";

@Injectable()
export class HttpProcessManagerService implements IProcessManager {
    private static resourceToProcess (resource: any): IProcess {
        return {
            programName: genericFromBase64(resource.attributes.programId),
            filePath: genericFromBase64(resource.attributes.filePath),
            args: resource.attributes.args || [ ],
            pid: resource.id
        };
    }

    private eventEmitter = new EventEmitter();
    private io: SocketIOClient.Socket;

    public constructor (private http: Http, @Inject(DOCUMENT) private document) {
        console.log(`${document.location.protocol}//${document.location.hostname}:${document.location.port}`);
        this.io = io(`${document.location.protocol}//${document.location.hostname}:${document.location.port}`);
        this.socketIoRegisterNewSocketHandler();
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
        }).toPromise()).json().data;

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
        await this.http.patch(`/api/processes/${pid}/stderr`, data);
    }

    public async getProcess (pid: number): Promise<IProcess> {
        let response = await this.http.get(`/api/processes/${pid}`).toPromise();
        return HttpProcessManagerService.resourceToProcess(response);
    }

    public on (event: string, handler: Function) {
        this.eventEmitter.on(event, handler);
    }

    private socketIoRegisterNewSocketHandler () {
        this.io.on('process_new', (process: IProcess) => {
            console.log(process);
        });
    }
}
