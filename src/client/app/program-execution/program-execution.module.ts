import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {HttpProcessManagerService} from "./http-process-manager.service";
import {ProgramExecutionComponent} from "./program-execution.component";
import {FormsModule} from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    providers: [
        HttpProcessManagerService
    ],
    declarations: [
        ProgramExecutionComponent
    ],
    exports: [
        ProgramExecutionComponent
    ]
})
export class ProgramExecutionModule { }
