import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BlocklyComponent} from './editor.component';
import {MaterializeModule} from "angular2-materialize";
import {ProgramExecutionModule} from '../program-execution/program-execution.module';
import {AngularSplitModule} from "angular-split";
import {TextIdeModule} from "../text-ide/text-ide.module";

@NgModule({
    imports: [
        MaterializeModule,
        CommonModule,
        ProgramExecutionModule,
        AngularSplitModule,
        TextIdeModule,
    ],
    declarations: [
        BlocklyComponent,
    ],
    exports: [
        BlocklyComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlocklyModule { }
