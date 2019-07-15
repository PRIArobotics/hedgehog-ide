import {AfterViewInit, Component, EventEmitter, ViewEncapsulation} from '@angular/core';
import {HttpHedgehogClientService} from "./hedgehog-control/http-hedgehog-client.service";
import {MaterializeAction} from "angular2-materialize";

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

    private ucId: string = "...";
    private hardwareVersion: string = "...";
    private firmwareVersion: string = "...";
    private serverVersion: string = "...";
    private ideVersion: string = "...";
    private aboutModalActions = new EventEmitter<string|MaterializeAction>();

    constructor (private hedgehogClient: HttpHedgehogClientService) {}

    public ngAfterViewInit(): void {
        // initialize all selects of the application here
        ($('select') as any).material_select();
    }

    public ngAfterContentInit(): void {
        this.hedgehogClient.getVersion().then(version => {
            let {ucId, hardwareVersion, firmwareVersion, serverVersion, ideVersion} = version;
            this.ucId = ucId;
            this.hardwareVersion = hardwareVersion;
            this.firmwareVersion = firmwareVersion;
            this.serverVersion = serverVersion;
            this.ideVersion = ideVersion;
        });
    }
}
