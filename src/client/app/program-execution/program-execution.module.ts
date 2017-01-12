import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {HttpProcessManagerService} from "./http-process-manager.service";
import {ProgramExecutionComponent} from "./program-execution.component";

@NgModule({
    imports: [
        CommonModule
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
