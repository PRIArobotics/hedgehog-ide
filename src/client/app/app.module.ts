import {BrowserModule} from "@angular/platform-browser";
import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";

import {AppComponent} from "./app.component";
import {TextIdeComponent} from "./text-ide/text-ide.component";
import {TextIdeModule} from "./text-ide/text-ide.module";
import {ProgramListComponent} from "./program/program-list.component";
import {ProgramModule} from "./program/program.module";

const appRoutes: Routes = [
    { path: '', component: ProgramListComponent },
    { path: 'ide', component: TextIdeComponent }
];

@NgModule({
    imports: [
        BrowserModule,
        ProgramModule,
        TextIdeModule,
        RouterModule.forRoot(appRoutes, {useHash: true})
    ],
    declarations: [ AppComponent ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
