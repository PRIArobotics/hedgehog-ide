import {Component, Output, EventEmitter} from "@angular/core";
import {HttpProcessManagerService} from "./http-process-manager.service";

@Component({
    moduleId: module.id,
    selector: 'program-execution',
    templateUrl: 'program-execution.component.html',
    styleUrls: ['program-execution.component.css'],
})
export class ProgramExecutionComponent {
    public isRunning: boolean = false;
    public output: string = '';

    private showPanel = false;

    private processPid: number;

    @Output() private onExit = new EventEmitter();

    public constructor (private processManager: HttpProcessManagerService) {
        processManager.on('stdout', (pid: number, data: string) => {
            this.output += data;
        });

        processManager.on('stderr', (pid: number, data: string) => {
            this.output += data;
        });

        processManager.on('exit', (pid: number) => {
            if (pid === this.processPid) {
                this.processPid = 0;
                this.isRunning = false;
                this.onExit.emit({});
            }
        });
    }

    public async run (programName: string, filePath: string, args?: string[]) {
        this.isRunning = true;
        this.showPanel = true;
        this.output = '';
        this.processPid = (await this.processManager.run(programName, filePath, args)).pid;
    }
}
