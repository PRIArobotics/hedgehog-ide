import { Component, OnInit } from '@angular/core';

declare var Blockly: any;

@Component({
  selector: 'my-app',
  templateUrl: 'app/blockly/blockly.component.html'
})
export class BlocklyComponent implements OnInit {

    private _workspace: any;

    ngOnInit(): void {
        var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});

        this._workspace = Blockly.inject('blocklyDiv');
    }

}
