import {Component, Output, EventEmitter, OnDestroy} from "@angular/core";
import {HttpProcessManagerService} from "./http-process-manager.service";

@Component({
    selector: 'program-execution',
    template: require('./program-execution.component.html'),
    styles: [require('./program-execution.component.css')],
})
export class ProgramExecutionComponent implements OnDestroy {


    public isRunning: boolean = false;
    public input: string = '';

    public outputList: Object[] = [];

    private showPanel = false;

    private processPid: number;

    @Output() private onExit = new EventEmitter();
    @Output() private onVisibleChange = new EventEmitter();

    public constructor (private processManager: HttpProcessManagerService) {
        processManager.on('stdout', (pid: number, data: string) => {
            this.outputList.push({
                type: 'stdout',
                data
            });
        });

        processManager.on('stderr', (pid: number, data: string) => {
            this.outputList.push({
                type: 'stderr',
                data
            });
        });

        processManager.on('exit', (pid: number) => {
            if (pid === this.processPid) {
                this.processPid = 0;
                this.isRunning = false;
                this.onExit.emit({});
            }
        });
    }

    public async ngOnDestroy(): Promise<void> {
        await this.processManager.kill(this.processPid);
    }

    public async run (programName: string, filePath: string, args?: string[]) {
        this.isRunning = true;
        if (!this.showPanel)
            this.onVisibleChange.emit(true);
        this.showPanel = true;
        this.outputList = [];
        this.processPid = (await this.processManager.run(programName, filePath, args)).pid;
    }

    public async sendInput () {
        if (this.isRunning) {
            await this.processManager.writeStdin(this.processPid, this.input + '\n');

            this.outputList.push({
                type: 'stdin',
                data: this.input
            });

            this.input = '';
        }
    }

    public async stop () {
        if (this.isRunning) {
            this.outputList.push({
                type: 'stdout',
                data: 'program stopped ...'
            });

            await this.processManager.kill(this.processPid);
        }
    }

    public async hide () {
        if(this.isRunning)
            await this.stop();

        this.showPanel = false;
        this.onVisibleChange.emit(false);
    }
}
