import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {TreeModule} from 'angular2-tree-component';
import {ContextMenuModule} from 'angular2-contextmenu';

import {MaterializeModule} from 'angular2-materialize';
import {AceEditorComponent} from './ace-editor.component';
import {HttpModule} from '@angular/http';
import {ProgramExecutionModule} from '../program-execution/program-execution.module';

import {TextIdeComponent} from './text-ide.component';
import 'brace';
import {AngularSplitModule} from "angular-split";

import { Subject } from 'rxjs';
console.log(Subject)

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        TreeModule,
        ContextMenuModule,
        FormsModule,
        HttpModule,
        ProgramExecutionModule,
        AngularSplitModule,
    ],
    declarations: [
        TextIdeComponent,
        AceEditorComponent
    ],
    exports: [
        AceEditorComponent
    ]
})

export class TextIdeModule { }
