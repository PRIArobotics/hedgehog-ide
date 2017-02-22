import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'output-control',
    template: require('./output-control.component.html'),
    styles: [require('./output-control.component.css')]
})
export default class OutputControlComponent {
    @Input() public name: string;
    @Input() public value: number;
    @Input() public state: boolean;
    @Input() public maxValue: number = 100;
    @Input() public minValue: number = 0;

    @Output() private stateChanged = new EventEmitter();
    @Output() private valueChanged = new EventEmitter();

    private updateValue (value) {
        this.value = value;
        this.valueChanged.emit(value);
    }

    private updateState (state) {
        this.state = state;
        this.stateChanged.emit(state);
    }
}
