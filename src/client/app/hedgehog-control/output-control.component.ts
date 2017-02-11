import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'output-control',
    template: require('./output-control.component.html'),
    styles: [require('./output-control.component.css')]
})
export default class OutputControlComponent {
    @Input() public value: number;
    @Input() public state: boolean;

    @Output() private stateChanged = new EventEmitter();
    @Output() private valueChanged = new EventEmitter();

    private updateValue (value) {
        this.value = value;
        this.valueChanged.emit(value);
    }

    private updateState (state) {
        this.state = state;
        this.valueChanged.emit(state);
    }
}
