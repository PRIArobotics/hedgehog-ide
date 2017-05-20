import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {MaterializeAction} from "angular2-materialize";
import {HttpProgramService} from "./http-program.service";
import {Router} from "@angular/router";
import {AppComponent} from "../app.component";
import {ContextMenuComponent} from "angular2-contextmenu";

declare var Materialize: any;

import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {default as Program} from "../../../common/versioncontrol/Program";

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

    @ViewChild(ContextMenuComponent) public programListContextMenu: ContextMenuComponent;

    private storage: IProgramStorage;
    private programs: string[];

    private newProgramData = {
        name: '',
        type: '',
        copyFrom: ''
    };

    private deleteProgramName: string = '';
    private renameProgramData: {oldName: string, newName: string} = {
        oldName: '',
        newName: ''
    };

    private showTemplates = false;

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
        this.newProgramData = {
            name: '',
            type,
            copyFrom: null
        };
        this.createModalActions.emit({action:"modal", params:['open']});
        AppComponent.fixModalOverlay();
    }

    public closeCreateModal() {
        this.createModalActions.emit({action:"modal", params:['close']});
    }

    public async createProgram() {
        let programName = this.newProgramData.name;
        if (this.newProgramData.type !== 'textual')
            programName += '.' + this.newProgramData.type;
        await this.storage.createProgram(programName, this.newProgramData.copyFrom);
        await this.reloadProgramList();
    }

    public openDeleteModal(programName: string) {
        this.deleteProgramName = programName;
        this.deleteModalActions.emit({action:"modal", params:['open']});
        AppComponent.fixModalOverlay();
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
        AppComponent.fixModalOverlay();
    }

    public closeRenameModal() {
        this.renameProgramData.oldName = '';
        this.renameModalActions.emit({action:"modal", params:['close']});
    }

    public async renameProgram() {
        this.renameProgramData.newName += Program.getExtension(this.renameProgramData.oldName);

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

    public async convertFromVisual (visualName: string) {
        let textualName = Program.getNameWithoutExtension(visualName);
        let counter = 0;
        while (this.programs.indexOf(textualName + (counter ? counter : '')) !== -1)
            counter++;
        textualName += (counter ? counter : '');

        try {
            let textualProgram = await this.storage.createProgram(textualName);
            const code = await this.storage.getWorkingTreeFileContent(visualName, 'code.py');

            await (await textualProgram.getWorkingTreeRoot()).addFile('main.py', code);
            await this.reloadProgramList();
            Materialize.toast(
                '<i class="material-icons">done</i> Successfully converted  "'
                + visualName + '" to "' + textualName + '"', 3000);
        } catch (err) {
            Materialize.toast(
                '<i class="material-icons">close</i> Failed to convert "' + visualName + '"', 3000, 'red');
        }
    }

    public getExtension (name: string) {
        return Program.getExtension(name);
    }

    public getNameWithoutExtension (name: string) {
        return Program.getNameWithoutExtension(name);
    }
}
