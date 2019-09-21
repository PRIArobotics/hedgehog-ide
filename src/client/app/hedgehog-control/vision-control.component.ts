import {Component, Input, EventEmitter, Output} from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";

@Component({
    selector: 'vision-control',
    template: require('./vision-control.component.html'),
    styles: [require('./vision-control.component.css')]
})
export default class VisionControlComponent {
    @Input() public name: string;
    @Input() public frameUrl: SafeUrl;

    // @Output() private pullupChanged = new EventEmitter();

    public constructor () {}
}
