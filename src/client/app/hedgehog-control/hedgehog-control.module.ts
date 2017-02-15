import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import HedgehogControlComponent from "./hedgehog-control.component";
import OutputControlComponent from "./output-control.component";
import {HttpHedgehogClientService} from "./http-hedgehog-client.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        HedgehogControlComponent,
        OutputControlComponent
    ],
    providers: [
        HttpHedgehogClientService
    ]
})

export class HedgehogControlModule { }
