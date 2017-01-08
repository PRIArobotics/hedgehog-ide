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

    public constructor(storageService: HttpProgramService) {
        this.storage = storageService.getStorage();
    }

    public async ngOnInit() {
        // add programs for testing

        try {
            let program = await this.storage.createProgram('program 1');

            let rootdir = await program.getWorkingTreeRoot();

            // with a few files and a subdirectory
            await rootdir.addFile('file1.py', 'testfile1');
            await rootdir.addFile('file2.py', 'testfile2');

            await rootdir.addDirectory('dir');
            let dir = await rootdir.getDirectory('dir');
            await dir.addFile('file3.py', 'testfile3');
            await dir.addFile('file4.py', 'testfile4');
        } catch (e) {
            console.log(e);
        }


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
