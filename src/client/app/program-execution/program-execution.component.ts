import {Component, Output, EventEmitter, OnDestroy, OnInit} from "@angular/core";
import {HttpProcessManagerService} from "./http-process-manager.service";
import {HttpHedgehogClientService} from "../hedgehog-control/http-hedgehog-client.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'program-execution',
    template: require('./program-execution.component.html'),
    styles: [require('./program-execution.component.css')],
})
export class ProgramExecutionComponent implements OnDestroy, OnInit {
    public isRunning: boolean = false;
    public commandInProgress: boolean = false;
    public input: string = '';

    public outputList: Array<{type: string, data: string}> = [];

    private showPanel = false;

    private processPid: number;
    private killedPidBuffer: number[] = [];
    private bufferedOutput: Array<{type: string, data: string}>  = [];

    private replay: {
        programName: string,
        filePath: string,
        args?: string[]
    };

    @Output() private onExit = new EventEmitter();
    @Output() private onVisibleChange = new EventEmitter();

    private emergencySubscription: Subscription;

    public constructor (private processManager: HttpProcessManagerService,
                        private hedgehogClient: HttpHedgehogClientService) {
        processManager.on('stdout', (pid: number, data: string) => {
            if (pid === this.processPid || (!this.processPid && this.isRunning))
                this.writeToConsole('stdout', data);
        });

        processManager.on('stderr', (pid: number, data: string) => {
            if (pid === this.processPid || (!this.processPid && this.isRunning))
                this.writeToConsole('stderr', data);
        });

        processManager.on('exit', (pid: number) => {
            if (pid === this.processPid) {
                this.resetProcess();
            } else if (!this.processPid && this.isRunning) {
                this.killedPidBuffer.push(pid);
            }
        });

        this.emergencySubscription = hedgehogClient.onEmergencyStop().subscribe(async ({active}) => {
            // TODO
        });
    }

    public ngOnInit (): void {
        let outputDiv = document.getElementById("output");
        $('body').on('DOMSubtreeModified', "#output", () => {
            outputDiv.scrollTop = outputDiv.scrollHeight;
        });
    }

    public resetProcess () {
        this.processPid = 0;
        this.isRunning = false;
        this.onExit.emit({});
    }

    public async ngOnDestroy (): Promise<void> {
        await this.stop();
    }

    public async run (programName: string, filePath: string, args?: string[]) {
        this.commandInProgress = true;
        if (!this.showPanel)
            this.onVisibleChange.emit(true);
        this.showPanel = true;
        this.outputList = [];

        try {
            this.processPid = (await this.processManager.run(programName, filePath, args)).pid;
        } catch (err) {
            this.commandInProgress = false;
            this.outputList.push({type: 'stderr', data: `Failed to run '${filePath}'`});
            return;
        }

        this.commandInProgress = false;
        this.isRunning = true;
        this.replay = {
            programName,
            filePath,
            args
        };

        let index = this.killedPidBuffer.indexOf(this.processPid);
        if (index !== -1) {
            this.resetProcess();
            this.killedPidBuffer.splice(index, 1);
            this.outputList = this.bufferedOutput;
            this.bufferedOutput = [];
        }
    }

    public async sendInput () {
        if (this.isRunning) {
            await this.processManager.writeStdin(this.processPid, this.input + '\n');
            this.writeToConsole('stdin', this.input);
            this.input = '';
        }
    }

    public async stop () {
        this.emergencySubscription.unsubscribe();
        if (this.isRunning) {
            this.commandInProgress = true;

            try {
                await this.processManager.kill(this.processPid);
            } catch (err) {
                this.commandInProgress = false;
                this.outputList.push({type: 'stderr', data: `Failed to stop process`});
                return;
            }

            this.writeToConsole('stdout', 'Program stopped');
            this.commandInProgress = false;
            this.isRunning = false;
        }
    }

    public async hide () {
        if(this.isRunning)
            await this.stop();

        this.showPanel = false;
        this.onVisibleChange.emit(false);
    }

    public writeToConsole(type: string, data: string): void {
        // Show only the last 500 lines in the console
        if(this.outputList.length === 500)
            this.outputList.splice(0, 1);

        this.outputList.push({type, data});
    }
}
