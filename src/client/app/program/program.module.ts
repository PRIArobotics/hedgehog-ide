import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ProgramListComponent} from "./program-list.component";
import {MaterializeModule} from "angular2-materialize";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import VersionListComponent from "./version-list.component";
import DirectoryViewComponent from "./directory-view.component";
import {KeysPipe} from "./directory-view.component";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        FormsModule,
        RouterModule
    ],
    declarations: [
        ProgramListComponent,
        VersionListComponent,
        DirectoryViewComponent,
        KeysPipe
    ]
})
export class ProgramModule { }
