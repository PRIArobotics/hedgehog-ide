import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";

import {VisionChannelKind} from "./http-hedgehog-client.service";

@Component({
    selector: 'vision-control',
    template: require('./vision-control.component.html'),
    styles: [require('./vision-control.component.css')]
})
export default class VisionControlComponent {
    @Input() public name: string;
    @Input() public frameUrl: SafeUrl;
    @Input() public channel: VisionChannelKind;

    @Output() private channelChanged = new EventEmitter();

    private VisionChannelKind = VisionChannelKind;

    public constructor () {}

    private updateChannel (channel) {
        this.channel = channel;
        this.channelChanged.emit(channel);
    }
}
