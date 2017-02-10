import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import HedgehogControlComponent from "./hedgehog-control.component";
import OutputControlComponent from "./output-control.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        HedgehogControlComponent,
        OutputControlComponent
    ]
})

export class HedgehogControlModule { }
