import { Component, AfterViewInit } from '@angular/core';

declare var Blockly: any;

@Component({
    selector: 'my-app',
    templateUrl: 'app/blockly/editor.component.html'
})
export class BlocklyComponent implements AfterViewInit {

    private _workspace: any;

    ngAfterViewInit(): void {

        let toolbox: any = {toolbox: document.getElementById('toolbox'),
            zoom: {controls: true,
                   wheel: true,
                   startScale: 1.0,
                   maxScale: 2,
                   minScale: 0.8,
                   scaleSpeed: 1.1},
            grid: {spacing: 20,
                   length: 3,
                   colour: '#ccc',
                   snap: true},
            trashcan: true
        };

        this._workspace = Blockly.inject('blocklyDiv', toolbox);

    }

}
