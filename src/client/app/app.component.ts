import {Component, EventEmitter} from '@angular/core';
import {MaterializeAction} from "angular2-materialize";

declare const VERSION: string;

@Component({
    selector: 'my-app',
    template: require('./app.component.html'),
    styles: [require('./app.component.css')]
})
export class AppComponent {
    public static fixModalOverlay() {
        // This is extremely hacky but apparently, there is no other solution.
        // Move modal to right location as it should fill the whole screen otherwise
        // See https://github.com/Dogfalo/materialize/issues/1532
        // grab the dark overlay
        let overlay = $('.modal-overlay');
        // remove it
        overlay.detach();
        // attach it to the thing you want darkened
        $('router-outlet').after(overlay);
    };

    private aboutModalActions = new EventEmitter<string|MaterializeAction>();

    get version () {
        return VERSION;
    }
}
