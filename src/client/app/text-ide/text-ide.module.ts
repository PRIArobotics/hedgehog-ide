import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {TreeModule} from 'angular-tree-component';

import {MaterializeModule} from 'angular2-materialize';
import {AceEditorComponent} from './ace-editor.component';
import {HttpClientModule} from '@angular/common/http';
import {ProgramExecutionModule} from '../program-execution/program-execution.module';

import {TextIdeComponent} from './text-ide.component';
import {AngularSplitModule} from "angular-split";
import {ContextMenuModule} from "ngx-contextmenu";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        TreeModule,
        ContextMenuModule,
        FormsModule,
        HttpClientModule,
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
