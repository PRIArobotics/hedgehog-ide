import {BrowserModule} from "@angular/platform-browser";
import {Routes, RouterModule} from "@angular/router";
import {NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER} from "@angular/core";
import {FormsModule} from "@angular/forms";

import {AppComponent} from "./app.component";
import {TextIdeComponent} from "./text-ide/text-ide.component";
import {TextIdeModule} from "./text-ide/text-ide.module";
import {ProgramListComponent} from "./program/program-list.component";
import {ProgramModule} from "./program/program.module";
import {BlocklyModule} from "./blockly/editor.module";
import {BlocklyComponent} from "./blockly/editor.component";
import {HedgehogControlModule} from "./hedgehog-control/hedgehog-control.module";
import HedgehogControlComponent from "./hedgehog-control/hedgehog-control.component";
import VersionListComponent from "./program/version-list.component";
import DirectoryViewComponent from "./program/directory-view.component";
import FileViewComponent from "./program/file-view.component";
import {MaterializeModule} from "angular2-materialize";
import {AuthGuardComponent} from "./auth-guard.component";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {HeaderInterceptor} from "./header-interceptor.service";
import {AuthProvider} from "./auth-provider.service";
import {ConfigurationService, default as initConfigurationService} from "./util/configuration-service";

const appRoutes: Routes = [
    {
        path: '',
        component: ProgramListComponent
    },
    {
        path: 'text-ide/:programName',
        component: TextIdeComponent
    },
    {
        path: '*',
        redirectTo: '/'
    },
    {
        path: 'blockly/:programName',
        component: BlocklyComponent
    },
    {
        path: 'hedgehog-control',
        component: HedgehogControlComponent
    },
    {
        path: 'versions/:programName',
        component: VersionListComponent
    },
    {
        path: 'versions/:programName/:treeId',
        component: DirectoryViewComponent
    },
    {
        path: 'versions/:programName/blobs/:blobId',
        component: FileViewComponent
    }
];

@NgModule({
    imports: [
        MaterializeModule,
        BrowserModule,
        FormsModule,
        ProgramModule,
        TextIdeModule,
        BlocklyModule,
        HedgehogControlModule,
        RouterModule.forRoot(appRoutes),
        HttpClientModule,
    ],
    declarations: [
        AppComponent,
        AuthGuardComponent
    ],
    bootstrap: [ AuthGuardComponent ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    providers: [
        ConfigurationService,
        AuthProvider,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HeaderInterceptor,
            multi: true,
        },
        // This makes sure the configuration is loaded before any UI components are shown
        {
            provide: APP_INITIALIZER,
            useFactory: initConfigurationService,
            deps: [ConfigurationService],
            multi: true
        }
    ]
})
export class AppModule { }
