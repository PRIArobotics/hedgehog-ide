import { NgModule, CUSTOM_ELEMENTS_SCHEMA }  from '@angular/core';
import { BlocklyComponent }  from './editor.component';
import {MaterializeModule} from "angular2-materialize";
import {ProgramExecutionModule} from '../program-execution/program-execution.module';

@NgModule({
    imports: [
        MaterializeModule,
        ProgramExecutionModule,
    ],
    declarations: [BlocklyComponent],
    exports: [BlocklyComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlocklyModule { }
