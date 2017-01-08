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
        path: 'blockly',
        component: BlocklyComponent
    }
];

@NgModule({
    imports: [
        BrowserModule,
        ProgramModule,
        TextIdeModule,
        BlocklyModule,
        RouterModule.forRoot(appRoutes)
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [ AppComponent ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
