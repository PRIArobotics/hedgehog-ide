import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ProgramListComponent} from "./program-list.component";
import {MaterializeModule} from "angular2-materialize";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import VersionListComponent from "./version-list.component";
import {default as DirectoryViewComponent, KeysPipe} from "./directory-view.component";
import FileViewComponent from "./file-view.component";
import {TextIdeModule} from "../text-ide/text-ide.module";
import ProgramExtensionPipe from "./program-extension.pipe";
import {ContextMenuModule} from "ngx-contextmenu";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        FormsModule,
        RouterModule,
        ContextMenuModule,
        TextIdeModule
    ],
    declarations: [
        ProgramListComponent,
        VersionListComponent,
        DirectoryViewComponent,
        KeysPipe,
        FileViewComponent,
        ProgramExtensionPipe
    ]
})
export class ProgramModule { }
