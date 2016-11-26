import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ProgramListComponent} from "./program-list.component";
import {MaterializeModule} from "angular2-materialize";
import {FormsModule} from "@angular/forms";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        FormsModule
    ],
    declarations: [
        ProgramListComponent
    ]
})
export class ProgramModule { }
