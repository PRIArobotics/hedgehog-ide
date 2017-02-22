import {BrowserModule} from "@angular/platform-browser";
import {Routes, RouterModule} from "@angular/router";
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

import {AppComponent} from "./app.component";
import {TextIdeComponent} from "./text-ide/text-ide.component";
import {TextIdeModule} from "./text-ide/text-ide.module";
import {ProgramListComponent} from "./program/program-list.component";
import {ProgramModule} from "./program/program.module";
import {BlocklyModule} from "./blockly/editor.module";
import {BlocklyComponent} from "./blockly/editor.component";
import {HedgehogControlModule} from "./hedgehog-control/hedgehog-control.module";
import HedgehogControlComponent from "./hedgehog-control/hedgehog-control.component";
import VersionListComponent from "./program/version-list.component";
import DirectoryViewComponent from "./program/directory-view.component";

const appRoutes: Routes = [
    {
        path: '',
        component: ProgramListComponent
    },
    {
        path: 'text-ide/:programName',
        component: TextIdeComponent
    },
    {
        path: '*',
        redirectTo: '/'
    },
    {
        path: 'blockly/:programName',
        component: BlocklyComponent
    },
    {
        path: 'hedgehog-control',
        component: HedgehogControlComponent
    },
    {
        path: 'versions/:programName',
        component: VersionListComponent
    },
    {
        path: 'versions/:programName/:treeId',
        component: DirectoryViewComponent
    }
];

@NgModule({
    imports: [
        BrowserModule,
        ProgramModule,
        TextIdeModule,
        BlocklyModule,
        HedgehogControlModule,
        RouterModule.forRoot(appRoutes)
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [ AppComponent ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
