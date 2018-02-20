import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {HttpProgramService} from "../program/http-program.service";
import Program from "../../../common/versioncontrol/Program";
import {ProgramExecutionComponent} from '../program-execution/program-execution.component';

declare var Blockly: any;

@Component({
    selector: 'blockly-ide',
    template: require('./editor.component.html'),
    styles: [require('./editor.component.scss')],
    providers: [
        HttpProgramService
    ]
})
export class BlocklyComponent implements OnInit, OnDestroy {

    private workspace: any;

    // The Program name that is passed to this class by the router
    private programName: string;

    // remote storage
    private storage: IProgramStorage;
    private program: Program;
    private rootDir;

    // store the last time the workspace was saved
    private lastSave: number;

    // save generated python code for access in the view
    private pyCode: string;

    // show/hide the resulting python code in the view
    private showCode: boolean = false;

    @ViewChild(ProgramExecutionComponent)
    private programExecution: ProgramExecutionComponent;

    private executionPanelVisible: boolean = false;

    constructor(route: ActivatedRoute, storageService: HttpProgramService) {
        this.programName = route.snapshot.params['programName'];
        this.storage = storageService.getStorage();
    }

    public async run () {
        this.saveWorkspace();
        await this.rootDir.addFile("code.py", this.toPython());
        await this.programExecution.run(this.programName, "code.py");
    }

    public clearWorkspace(): void {
        this.workspace.clear();
    }

    public toggleShowCode(): void {
        this.showCode = ! this.showCode;
        setTimeout(() => {
            this.resizeWindow();
        }, 0);
    }

    public async saveWorkspace() {
        await this.rootDir.addFile("workspace.xml", this.toXML());
        this.lastSave = new Date().getTime();
    }

    public resizeWindow() {
        window.dispatchEvent(new Event('resize'));
    }

    public ngOnDestroy() {
        this.saveWorkspace();
    }

    public async ngOnInit() {

        this.program = await this.storage.getProgram(this.programName);
        this.rootDir = await this.program.getWorkingTreeRoot();

        if (this.rootDir.items.includes("lang")) {
            this.loadLang(await (await this.rootDir.getFile("lang")).readContent());
        } else {
            this.loadLang("en");
        }

        await this.injectBlockly();

        // load workspace from remote storage if it exists
        if (this.rootDir.items.includes("workspace.xml")) {
            this.toWorkspace(await (await this.rootDir.getFile("workspace.xml")).readContent());
        }

        // add change listener
        this.workspace.addChangeListener(e => this.onWorkspaceChange());
        this.lastSave = new Date().getTime();

    }

    public loadLang(lang: string) {
        let node1 = document.createElement('script');
        node1.src = "app/blockly/lib/msg/js/" + lang + ".js";
        node1.type = 'text/javascript';
        node1.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node1);

        let node2 = document.createElement('script');
        node2.src = "app/blockly/lib/msg/js/" + lang + "-hedgehog.js";
        node2.type = 'text/javascript';
        node2.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node2);
    }

    public async setLanguage(lang: string) {
        await this.rootDir.addFile("lang", lang);
        window.location.reload();
    }

    private injectBlockly() {
        let options: any = {
            toolbox: document.getElementById('toolbox'),
            zoom: {
                controls: false,
                wheel: true,
                startScale: 1.0,
                maxScale: 2,
                minScale: 0.8,
                scaleSpeed: 1.05
            },
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            trashcan: false,
            maxBlocks: 400,
            scrollbars: true,
            media: 'app/blockly/lib/media/'
        };

        this.workspace = Blockly.inject('blocklyDiv', options);
    }

    private onWorkspaceChange() {
        if(this.workspace.isDragging()) {
            return;
        }
        this.pyCode = this.toPython();
        let currentDate = new Date().getTime();
        if((currentDate - this.lastSave) > 1000) {
            this.saveWorkspace();
        }
    }

    private toWorkspace(xml: string) {
        let dom = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(dom, this.workspace);
    }

    private toPython(): string {
        Blockly.Python.INFINITE_LOOP_TRAP = null;
        return Blockly.Python.workspaceToCode(this.workspace);
    }

    private toXML(): string {
        let dom = Blockly.Xml.workspaceToDom(this.workspace);
        return Blockly.Xml.domToText(dom);
    }
}
