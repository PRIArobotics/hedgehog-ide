import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';

import { AppComponent }         from './app.component';

import { MaterializeDirective } from "angular2-materialize";


import { AceEditorDirective }   from './ace-editor.directive';
import { DragDirective }        from "./tab-drag.directive";
import { CollapseOnClick }      from "./collapse-on-click.directive";
import { LoadTabs}              from "./load-tabs.directive";

@NgModule({
    imports:      [ BrowserModule ],
    declarations: [ AppComponent, AceEditorDirective, CollapseOnClick, DragDirective, MaterializeDirective, LoadTabs ],
    bootstrap:    [ AppComponent ],
})

export class AppModule { }
