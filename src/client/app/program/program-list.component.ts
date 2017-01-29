import {Component, OnInit, EventEmitter} from '@angular/core';
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {MaterializeAction} from "angular2-materialize";
import {HttpProgramService} from "./http-program.service";
import {Router} from "@angular/router";

@Component({
    selector: 'program-list',
    template: require('./program-list.component.html'),
    styles: [require('./program-list.component.css')],
    providers: [
        HttpProgramService
    ]
})
export class ProgramListComponent implements OnInit {
    public createModalActions = new EventEmitter<string|MaterializeAction>();
    public deleteModalActions = new EventEmitter<string|MaterializeAction>();
    public renameModalActions = new EventEmitter<string|MaterializeAction>();

    private storage: IProgramStorage;
    private programs: string[];

    private newProgramName: string;
    private deleteProgramName: string = '';
    private newProgramType: string;
    private renameProgramData: {oldName: string, newName: string} = {
        oldName: '',
        newName: ''
    };

    public constructor(private router: Router, storageService: HttpProgramService) {
        this.storage = storageService.getStorage();
    }

    public async ngOnInit() {
        // add programs for testing
        return this.reloadProgramList();
    }

    public async reloadProgramList() {
        this.programs = await this.storage.getProgramNames();
    }

    public openCreateModal(type: string) {
        this.newProgramType = type;
        this.createModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    public closeCreateModal() {
        this.createModalActions.emit({action:"modal", params:['close']});
    }

    public async createProgram() {
        if(this.newProgramType === "blockly") {
            await this.storage.createProgram(this.newProgramName + ".blockly");
        } else {
            await this.storage.createProgram(this.newProgramName);
        }
        this.newProgramName = '';
        await this.reloadProgramList();
    }

    public openDeleteModal(programName: string) {
        this.deleteProgramName = programName;
        this.deleteModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    public closeDeleteModal() {
        this.deleteModalActions.emit({action:"modal", params:['close']});
    }

    public async deleteProgram() {
        await this.storage.deleteProgram(this.deleteProgramName);
        await this.reloadProgramList();
        this.deleteProgramName = '';
    }

    public openRenameModal(programName: string) {
        this.renameProgramData.oldName = programName;
        this.renameModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    public closeRenameModal() {
        this.renameProgramData.oldName = '';
        this.renameModalActions.emit({action:"modal", params:['close']});
    }

    public async renameProgram() {
        if (this.renameProgramData.oldName.endsWith('.blockly')) {
            this.renameProgramData.newName = this.renameProgramData.newName + '.blockly';
        }

        await this.storage.renameProgram(this.renameProgramData.oldName, this.renameProgramData.newName);
        await this.reloadProgramList();
        this.renameProgramData.oldName = '';
        this.renameProgramData.newName = '';
    }

    public openRoute(event, program) {
        if (event.target.type !== 'submit' && event.target.parentNode.type !== 'submit') {
            if (program.endsWith('.blockly')) {
                this.router.navigate(['/blockly', program]);
            } else {
                this.router.navigate(['/text-ide', program]);
            }
        }
    }

    private fixModalOverlay() {
        // This is extremely hacky but apparently, there is no other solution.
        // Move modal to right location as it should fill the whole screen otherwise
        // See https://github.com/Dogfalo/materialize/issues/1532
        // grab the dark overlay
        let overlay = $('.modal-overlay');
        // remove it
        overlay.detach();
        // attach it to the thing you want darkened
        $('router-outlet').after(overlay);
    };
}
