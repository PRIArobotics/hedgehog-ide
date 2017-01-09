import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

import {TreeModule} from 'angular2-tree-component';
import {ContextMenuModule} from 'angular2-contextmenu';

import {AceEditorDirective} from './ace-editor.directive';
import {MaterializeModule} from "angular2-materialize";

import {TextIdeComponent} from "./text-ide.component";
import {HttpModule} from "@angular/http";
import {ProgramExecutionComponent} from "../program-execution/program-execution.component";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        TreeModule,
        ContextMenuModule,
        FormsModule,
        HttpModule,
    ],
    declarations: [
        TextIdeComponent,
        ProgramExecutionComponent,
        AceEditorDirective
    ],
})

export class TextIdeModule { }
