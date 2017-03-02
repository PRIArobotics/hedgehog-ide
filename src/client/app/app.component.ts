import {Component, EventEmitter} from '@angular/core';
import {MaterializeAction} from "angular2-materialize";

declare const VERSION: string;

@Component({
    selector: 'my-app',
    template: require('./app.component.html'),
    styles: [require('./app.component.css')]
})
export class AppComponent {
    private aboutModalActions = new EventEmitter<string|MaterializeAction>();

    get version () {
        return VERSION;
    }
}
