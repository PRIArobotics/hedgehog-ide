import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {MaterializeAction} from "angular2-materialize";
import {HttpProgramService} from "./http-program.service";
import {Router} from "@angular/router";
import {ContextMenuComponent} from "ngx-contextmenu";

declare var Materialize: any;

import {AppComponent} from "../app.component";
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
    private language: string;
    
    //Felder für Sprachänderung
    private lang_change_language: string;
    private lang_programs: string;
    private lang_show_templates: string;
    private lang_program_name: string;
    private lang_create: string;
    private lang_create_program: string;
    private lang_close: string;
    private lang_delete_program: string;
    private lang_delete: string;
    private lang_rename_program: string;
    private lang_none: string;
    private lang_template: string;
    private lang_textural_project: string;
    private lang_visual_project: string;
    private lang_show_versions: string;
    private lang_convert_to_textural: string;
    private lang_rename_project: string;
    private lang_delete_project: string;
    private lang_new_visual_program: string;
    private lang_new_textural_program: string;
    private lang_new_template: string;
    private lang_template_name: string;
    private lang_delete_visual_sentence: string;
    private lang_delete_textural_sentence: string;
    private lang_cannot_undo_sentence: string;
    private lang_textural_program: string;
    private lang_visual_program: string;

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

    public constructor(private router: Router, storageService: HttpProgramService, private _cookieService: CookieService) {
        this.storage = storageService.getStorage();
        this.lang_change_language = "Change Language";
        this.lang_programs = "Programs";
        this.lang_show_templates = "Show Templates";
        this.lang_program_name = "Program Name";
        this.lang_create = "Create";
        this.lang_create_program = "Create Program";
        this.lang_close = "Close";
        this.lang_delete_program = "Delete Program";
        this.lang_delete = "Delete";
        this.lang_rename_program = "Rename Program";
        this.lang_none = "None";
        this.lang_template = "Template";
        this.lang_textural_project = "Textural Project";
        this.lang_visual_project = "Visual Project";
        this.lang_show_versions = "Show Versions";
        this.lang_convert_to_textural = "Convert to Textural";
        this.lang_rename_project = "Rename Project";
        this.lang_delete_project = "Delete Project";
        this.lang_new_textural_program = "New Textural Program";
        this.lang_new_visual_program = "New Visual Program";
        this.lang_new_template = "New Template";
        this.lang_template_name = "Template Name";
        this.lang_delete_visual_sentence = "Are you sure you want to delete this visual program:";
        this.lang_delete_textural_sentence = "Are you sure you want to delete this program:";
        this.lang_cannot_undo_sentence = "This operation cannot be undone!"
        this.lang_textural_program = "Textural Program";
        this.lang_visual_program = "Visual Program";
    }
    
    public async ngOnInit() {
        this.reloadProgramList();
        this.language = localStorage.getItem("lang");
        
        // add programs for testing
        switch(this.language) {
            case "de": {
                this.languageDe();
                break;
            }
            case "en": {
                this.languageEn();
                break;
            }
            case "cn": {
                this.languageCn();
            }
            default: {
                break;
            }
        }
        return;
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

        const copyFrom = this.newProgramData.copyFrom === 'none' ? null : this.newProgramData.copyFrom;

        await this.storage.createProgram(programName, copyFrom);
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

    public langBtn(param: string) {
        localStorage.setItem("lang", param);
        window.location.reload();
    }
    
    public languageEn() {
        this.lang_change_language = "Change Language";
        this.lang_programs = "Programs";
        this.lang_show_templates = "Show Templates";
        this.lang_program_name = "Program Name";
        this.lang_create = "Create";
        this.lang_create_program = "Create Program";
        this.lang_close = "Close";
        this.lang_delete_program = "Delete Program";
        this.lang_delete = "Delete";
        this.lang_rename_program = "Rename Program";
        this.lang_none = "None";
        this.lang_template = "Template";
        this.lang_textural_project = "Textural Project";
        this.lang_visual_project = "Visual Project";
        this.lang_show_versions = "Show Versions";
        this.lang_convert_to_textural = "Convert to Textural";
        this.lang_rename_project = "Rename Project";
        this.lang_delete_project = "Delete Project";
        this.lang_new_textural_program = "New Textural Program";
        this.lang_new_visual_program = "New Visual Program";
        this.lang_new_template = "New Template";
        this.lang_template_name = "Template Name";
        this.lang_delete_visual_sentence = "Are you sure you want to delete this visual program:";
        this.lang_delete_textural_sentence = "Are you sure you want to delete this program:";
        this.lang_cannot_undo_sentence = "This operation cannot be undone!"
        this.lang_textural_program = "Textural Program";
        this.lang_visual_program = "Visual Program";
    }
    
    public languageDe() {
        this.lang_change_language = "Sprache ändern";
        this.lang_programs = "Programme";
        this.lang_show_templates = "Vorlagen anzeigen";
        this.lang_program_name = "Programmname";
        this.lang_create = "Erstellen";
        this.lang_create_program = "Programm erstellen";
        this.lang_close = "Schließen";
        this.lang_delete_program = "Programm löschen";
        this.lang_delete = "Löschen";
        this.lang_rename_program = "Programm umbenennen";
        this.lang_none = "Keine";
        this.lang_template = "Vorlage";
        this.lang_textural_project = "Textuelles Projekt";
        this.lang_visual_project = "Grafisches Projekt";
        this.lang_show_versions = "Version anzeigen";
        this.lang_convert_to_textural = "Zu Textuell konvertieren";
        this.lang_rename_project = "Projekt umbennenen";
        this.lang_delete_project = "Projekt löschen";
        this.lang_new_textural_program = "Neues Textuelles Programm";
        this.lang_new_visual_program = "Neues Grafische Programm";
        this.lang_new_template = "Neue Vorlage";
        this.lang_template_name = "Vorlagenname";
        this.lang_delete_visual_sentence = "Wollen Sie dieses Grafik-Programm wirklich löschen:";
        this.lang_delete_textural_sentence = "Wollen Sie dieses Programm wirklich löschen:";
        this.lang_cannot_undo_sentence = "Diese Operation kann nicht rückgängig gemacht werden!";
        this.lang_textural_program = "Textuelles Programm";
        this.lang_visual_program = "Grafisches Programm";

    }
    
    public languageCn() {
        this.lang_change_language = "改变语言";
        this.lang_programs = "程序";
        this.lang_show_templates = "显示模板";
        this.lang_program_name = "程序名称";
        this.lang_create = "创建";
        this.lang_create_program = "创建程序";
        this.lang_close = "关";
        this.lang_delete_program = "删除程序";
        this.lang_delete = "删除";
        this.lang_rename_program = "改程序名称";
        this.lang_none = "没有";
        this.lang_template = "型板";
        this.lang_textural_project = "文本程序";
        this.lang_visual_project = "图形程序";
        this.lang_show_versions = "显示版本";
        this.lang_convert_to_textural = "转换为文本";
        this.lang_rename_project = "改名程序";
        this.lang_delete_project = "删除程序";
        this.lang_new_textural_program = "新的文本程序";
        this.lang_new_visual_program = "新的图形程序";
        this.lang_new_template = "新模板";
        this.lang_template_name = "模板名称";
        this.lang_delete_visual_sentence = "你真的想删除这个程序吗";
        this.lang_delete_textural_sentence = "你真的想删除这个程序吗？";
        this.lang_cannot_undo_sentence = "此操作无法撤消";
        this.lang_textural_program = "文本程序";
        this.lang_visual_program = "图形程序";

    }
}
