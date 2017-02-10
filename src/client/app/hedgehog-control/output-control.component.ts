import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'output-control',
    template: require('./output-control.component.html'),
    styles: [require('./output-control.component.css')]
})
export default class OutputControlComponent implements OnInit {
    public value: number = 0;

    constructor() { }

    public ngOnInit() { }

}
