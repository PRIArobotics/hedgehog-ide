import {AfterViewInit, Component, EventEmitter, ViewEncapsulation} from '@angular/core';
import {MaterializeAction} from "angular2-materialize";

declare const VERSION: string;

@Component({
    selector: 'my-app',
    template: require('./app.component.html'),
    styles: [require('./app.component.scss')],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    public static fixModalOverlay() {
        // This is extremely hacky but apparently, there is no other solution.
        // Move modal to right location as it should fill the whole screen otherwise
        // See https://github.com/Dogfalo/materialize/issues/1532
        // grab the dark overlay
        setTimeout(() => {
            let overlay = $('.modal-overlay');
            // remove it
            overlay.detach();
            // attach it to the thing you want darkened
            $('router-outlet').after(overlay);
        }, 40);
    }

    private aboutModalActions = new EventEmitter<string|MaterializeAction>();

    public ngAfterViewInit(): void {
        // initialize all selects of the application here
        ($('select') as any).material_select();
    }

    get version () {
        return VERSION;
    }
}
