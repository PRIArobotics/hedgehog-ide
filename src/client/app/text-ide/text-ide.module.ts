import { NgModule }             from '@angular/core';

import { TreeModule }           from 'angular2-tree-component';
import { ContextMenuModule} from 'angular2-contextmenu';

import { AceEditorDirective }   from './ace-editor.directive';
import { DragDirective }        from './tab-drag.directive';
import {TextIdeComponent} from "./text-ide.component";
import {CommonModule} from "@angular/common";
import {MaterializeModule} from "angular2-materialize";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        TreeModule,
        ContextMenuModule,
    ],
    declarations: [
        TextIdeComponent,
        AceEditorDirective,
        DragDirective,
    ],
})

export class TextIdeModule { }
