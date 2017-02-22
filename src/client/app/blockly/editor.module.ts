import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {CommonModule} from '@angular/common';
import { BlocklyComponent } from './editor.component';
import {MaterializeModule} from "angular2-materialize";
import {ProgramExecutionModule} from '../program-execution/program-execution.module';
import {AngularSplitModule} from "angular-split";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        ProgramExecutionModule,
        AngularSplitModule,
    ],
    declarations: [BlocklyComponent],
    exports: [BlocklyComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlocklyModule { }
