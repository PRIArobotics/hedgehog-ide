import { Component, OnInit, OnDestroy } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

import IProgramStorage from "../../../common/versioncontrol/ProgramStorage";
import {HttpProgramService} from "../program/http-program.service";
import Program from "../../../common/versioncontrol/Program";

/*
 * TODO: add toast notifications, run programs, split code view
 */
declare var Blockly: any;

@Component({
    selector: 'my-app',
    templateUrl: 'app/blockly/editor.component.html',
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

    constructor(route: ActivatedRoute, storageService: HttpProgramService) {
        this.programName = route.snapshot.params['programName'];
        this.storage = storageService.getStorage();
    }

    public clearWorkspace(): void {
        this.workspace.clear();
    }

    public async saveWorkspace() {
        await this.rootDir.addFile("workspace.xml", this.toXML());
        this.lastSave = new Date().getTime();
    }

    public ngOnDestroy() {
        this.saveWorkspace();
    }

    public async ngOnInit() {

        this.program = await this.storage.getProgram(this.programName);
        this.rootDir = await this.program.getWorkingTreeRoot();

        let toolbox: any = {toolbox: this.getToolbox(),
            zoom: {controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 2,
                minScale: 0.8,
                scaleSpeed: 1.05},
                grid: {spacing: 20,
                    length: 3,
                    colour: '#ccc',
                    snap: true},
                    trashcan: true,
                    maxBlocks: 100,
                    media: 'app/blockly/lib/media/'
        };

        this.workspace = Blockly.inject('blocklyDiv', toolbox);

        // load workspace from remote storage if it exists
        if (this.rootDir.items.includes("workspace.xml")) {
            this.toWorkspace(await (await this.rootDir.getFile("workspace.xml")).readContent());
        }

        // add change listener
        this.workspace.addChangeListener(e => this.onWorkspaceChange());
        this.lastSave = new Date().getTime();
    }

    private onWorkspaceChange() {
        let currentDate = new Date().getTime();
        if((currentDate - this.lastSave) > 10000) {
            this.saveWorkspace();
        }
    }

    private toWorkspace(xml: string) {
        let dom = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(dom, this.workspace);
    }

    // tslint:disable-next-line
    private toPython(): string {
        Blockly.Python.INFINITE_LOOP_TRAP = null;
        return Blockly.Python.workspaceToCode(this.workspace);
    }

    private toXML(): string {
        let dom = Blockly.Xml.workspaceToDom(this.workspace);
        return Blockly.Xml.domToText(dom);
    }

    private getToolbox(): string {
        return `<xml id="toolbox" style="display: none">
      <category name="Hedgehog" colour="120">
        <block type="hedgehog_move"></block>
        <block type="hedgehog_read_analog"></block>
        <block type="hedgehog_read_digital"></block>
      </category>
      <category name="Logic" colour="210">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_negate"></block>
        <block type="logic_boolean"></block>
        <block type="logic_null"></block>
        <block type="logic_ternary"></block>
      </category>
      <category name="Loops" colour="60">
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="controls_whileUntil"></block>
        <block type="controls_for">
          <value name="FROM">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="TO">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="BY">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="controls_forEach"></block>
        <block type="controls_flow_statements"></block>
      </category>
      <category name="Math" colour="230">
        <block type="math_number"></block>
        <block type="math_arithmetic">
          <value name="A">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="B">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="math_single">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">9</field>
            </shadow>
          </value>
        </block>
        <block type="math_trig">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">45</field>
            </shadow>
          </value>
        </block>
        <block type="math_constant"></block>
        <block type="math_number_property">
          <value name="NUMBER_TO_CHECK">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="math_round">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">3.1</field>
            </shadow>
          </value>
        </block>
        <block type="math_on_list"></block>
        <block type="math_modulo">
          <value name="DIVIDEND">
            <shadow type="math_number">
              <field name="NUM">64</field>
            </shadow>
          </value>
          <value name="DIVISOR">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="math_constrain">
          <value name="VALUE">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="LOW">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="HIGH">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
        <block type="math_random_int">
          <value name="FROM">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="TO">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
        <block type="math_random_float"></block>
      </category>
      <category name="Text" colour="160">
        <block type="text"></block>
        <block type="text_join"></block>
        <block type="text_append">
          <value name="TEXT">
            <shadow type="text"></shadow>
          </value>
        </block>
        <block type="text_length">
          <value name="VALUE">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_isEmpty">
          <value name="VALUE">
            <shadow type="text">
              <field name="TEXT"></field>
            </shadow>
          </value>
        </block>
        <block type="text_indexOf">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">list</field>
            </block>
          </value>
          <value name="FIND">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_charAt">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">list</field>
            </block>
          </value>
        </block>
        <block type="text_getSubstring">
          <value name="STRING">
            <block type="variables_get">
              <field name="VAR">list</field>
            </block>
          </value>
        </block>
        <block type="text_changeCase">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_trim">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_print">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_prompt_ext">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
      </category>
      <category name="Lists" colour="260">
        <block type="lists_create_with">
          <mutation items="0"></mutation>
        </block>
        <block type="lists_create_with"></block>
        <block type="lists_repeat">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">5</field>
            </shadow>
          </value>
        </block>
        <block type="lists_length"></block>
        <block type="lists_isEmpty"></block>
        <block type="lists_indexOf">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">list</field>
            </block>
          </value>
        </block>
        <block type="lists_getIndex">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">list</field>
            </block>
          </value>
        </block>
        <block type="lists_setIndex">
          <value name="LIST">
            <block type="variables_get">
              <field name="VAR">list</field>
            </block>
          </value>
        </block>
        <block type="lists_getSublist">
          <value name="LIST">
            <block type="variables_get">
              <field name="VAR">list</field>
            </block>
          </value>
        </block>
        <block type="lists_split">
          <value name="DELIM">
            <shadow type="text">
              <field name="TEXT">,</field>
            </shadow>
          </value>
        </block>
        <block type="lists_sort"></block>
      </category>
      <category name="Colors" colour="20">
        <block type="colour_picker"></block>
        <block type="colour_random"></block>
        <block type="colour_rgb">
          <value name="RED">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
          <value name="GREEN">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="BLUE">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="colour_blend">
          <value name="COLOUR1">
            <shadow type="colour_picker">
              <field name="COLOUR">#ff0000</field>
            </shadow>
          </value>
          <value name="COLOUR2">
            <shadow type="colour_picker">
              <field name="COLOUR">#3333ff</field>
            </shadow>
          </value>
          <value name="RATIO">
            <shadow type="math_number">
              <field name="NUM">0.5</field>
            </shadow>
          </value>
        </block>
      </category>
      <sep></sep>
      <category name="Variables" colour="330" custom="VARIABLE"></category>
      <category name="Functions" colour="290" custom="PROCEDURE"></category>`;
    }
}
