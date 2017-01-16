import {Component, OnInit, EventEmitter} from '@angular/core';
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {MaterializeAction} from "angular2-materialize";
import {HttpProgramService} from "./http-program.service";

@Component({
    moduleId: module.id,
    selector: 'program-list',
    templateUrl: 'program-list.component.html',
    styleUrls: ['program-list.component.css'],
    providers: [
        HttpProgramService
    ]
})
export class ProgramListComponent implements OnInit {
    public createModalActions = new EventEmitter<string|MaterializeAction>();
    public deleteModalActions = new EventEmitter<string|MaterializeAction>();

    private storage: IProgramStorage;
    private programs: string[];

    private newProgramName: string;
    private deleteProgramName: string;
    private newProgramType: string;

    public constructor(storageService: HttpProgramService) {
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
        if(this.newProgramType == "blockly") {
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
