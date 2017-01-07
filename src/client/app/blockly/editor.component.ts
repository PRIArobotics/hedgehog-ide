import { Component, AfterViewInit } from '@angular/core';

declare var Blockly: any;

@Component({
  selector: 'my-app',
  templateUrl: 'app/blockly/editor.component.html'
})
export class BlocklyComponent implements AfterViewInit {

    private _workspace: any;

    ngAfterViewInit(): void {
        var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});

        this._workspace = Blockly.inject('blocklyDiv');
    }

}
