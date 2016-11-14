import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';

import { AppComponent }         from './app.component';

import { MaterializeDirective } from 'angular2-materialize';
import { TreeModule }           from 'angular2-tree-component';
import { ContextMenuModule} from 'angular2-contextmenu';

import { AceEditorDirective }   from './ace-editor.directive';
import { DragDirective }        from './tab-drag.directive';

@NgModule({
    imports:      [ BrowserModule, TreeModule, ContextMenuModule ],
    declarations: [ AppComponent, AceEditorDirective, DragDirective, MaterializeDirective ],
    bootstrap:    [ AppComponent ],
})

export class AppModule { }
