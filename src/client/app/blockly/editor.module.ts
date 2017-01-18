import { NgModule, CUSTOM_ELEMENTS_SCHEMA }  from '@angular/core';
import { BlocklyComponent }  from './editor.component';
import {MaterializeModule} from "angular2-materialize";

@NgModule({
    imports: [MaterializeModule],
    declarations: [BlocklyComponent],
    exports: [BlocklyComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlocklyModule { }
