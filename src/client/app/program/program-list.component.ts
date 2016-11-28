import {Component, OnInit, EventEmitter} from '@angular/core';
import {DummyProgramService} from "./dummy-program.service";
import IProgramStorage from "../../../versioncontrol/ProgramStorage";
import {MaterializeAction} from "angular2-materialize";

@Component({
    moduleId: module.id,
    selector: 'program-list',
    templateUrl: 'program-list.component.html',
    styleUrls: ['program-list.component.css'],
    providers: [
        DummyProgramService
    ]
})
export class ProgramListComponent implements OnInit {
    public createModalActions = new EventEmitter<string|MaterializeAction>();
    public deleteModalActions = new EventEmitter<string|MaterializeAction>();

    private storage: IProgramStorage;
    private programs: string[];

    private newProgramName: string;
    private deleteProgramName: string;

    public constructor(storageService: DummyProgramService) {
        this.storage = storageService.getStorage();
    }

    public ngOnInit() {
        // add programs for testing
        this.storage.createProgram('program 1');

        return this.reloadProgramList();
    }

    public async reloadProgramList() {
        this.programs = await this.storage.getProgramNames();
    }

    public openCreateModal() {
        this.createModalActions.emit({action:"modal", params:['open']});
        this.fixModalOverlay();
    }

    public closeCreateModal() {
        this.createModalActions.emit({action:"modal", params:['close']});
    }

    public async createProgram() {
        console.log(this.newProgramName);
        await this.storage.createProgram(this.newProgramName);

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
        console.log(this.deleteProgramName)
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
