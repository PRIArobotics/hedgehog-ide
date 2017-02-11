import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ProgramListComponent} from "./program-list.component";
import {MaterializeModule} from "angular2-materialize";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import VersionListComponent from "./version-list.component";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        FormsModule,
        RouterModule
    ],
    declarations: [
        ProgramListComponent,
        VersionListComponent
    ]
})
export class ProgramModule { }
