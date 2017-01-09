import {Http} from "@angular/http";

import IProcessManager from "../../../common/ProcessManager";
import {IProcess} from "../../../common/ProcessManager";
import {genericToBase64, genericFromBase64} from "../../../common/utils";

export default class HttpProcessManager implements IProcessManager {

    private static resourceToProcess (resource: any): IProcess {
        return {
            programName: genericFromBase64(resource.attributes.programId),
            filePath: genericFromBase64(resource.attributes.filePath),
            args: resource.attributes.args || [ ],
            pid: resource.id
        };
    }

    private constructor (private http: Http) { }

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

        return HttpProcessManager.resourceToProcess(response);
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
        return HttpProcessManager.resourceToProcess(response);
    }

    public on (event: string, handler: Function) {

    }
}
