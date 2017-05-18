import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {MaterializeAction} from "angular2-materialize";
import {HttpProgramService} from "./http-program.service";
import {Router} from "@angular/router";
import {AppComponent} from "../app.component";
import {ContextMenuComponent} from "angular2-contextmenu";

declare var Materialize: any;

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
        AppComponent.fixModalOverlay();
    }

    public closeCreateModal() {
        this.createModalActions.emit({action:"modal", params:['close']});
    }

    public async createProgram() {
        if(this.newProgramType === "blockly") {
            await this.storage.createProgram(this.newProgramName + ".blockly");
        } else {
            let newProgram = await this.storage.createProgram(this.newProgramName);
            let root = await newProgram.getWorkingTreeRoot();
            await root.addFile('main.py',
                'from time import sleep\n' +
                'from hedgehog.client import connect\n\n' +
                'with connect(emergency=15) as hedgehog:\n' +
                '    print("Hello World")\n'
            );
        }
        this.newProgramName = '';
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

    public async convertFromVisual (visualName: string) {
        let textualName = visualName.substring(0, visualName.lastIndexOf('.blockly'));
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
}
