import { NgModule, CUSTOM_ELEMENTS_SCHEMA }  from '@angular/core';
import { BlocklyComponent }  from './editor.component';

@NgModule({
    declarations: [BlocklyComponent],
    exports: [BlocklyComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlocklyModule { }
