import { Component, AfterViewInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

declare var Blockly: any;

@Component({
    selector: 'my-app',
    templateUrl: 'app/blockly/editor.component.html'
})
export class BlocklyComponent implements AfterViewInit {

    private _workspace: any;
    //
    // The Program name that is passed to this class by the router
    private programName: string;

    constructor(route: ActivatedRoute) {
        this.programName = route.snapshot.params['programName'];
    }

    public clearWorkspace(): void {
        this._workspace.clear();
    }

    public ngAfterViewInit(): void {


        let tools: string = `<xml id="toolbox" style="display: none">
            <block type="controls_if"></block>
        </xml>`;

        let toolbox: any = {toolbox: tools,
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

        console.log(toolbox);

        this._workspace = Blockly.inject('blocklyDiv', toolbox);

    }

}
