import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';

import { AppComponent }         from './app.component';

import { MaterializeDirective } from 'angular2-materialize';

import { TreeModule }           from 'angular2-tree-component';

import { AceEditorDirective }   from './ace-editor.directive';
import { DragDirective }        from './tab-drag.directive';
import { LoadTabs }             from './load-tabs.directive';

@NgModule({
    imports:      [ BrowserModule, TreeModule ],
    declarations: [ AppComponent, AceEditorDirective, DragDirective, MaterializeDirective, LoadTabs ],
    bootstrap:    [ AppComponent ],
})

export class AppModule { }
