import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {HttpProcessManagerService} from "./http-process-manager.service";

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
        HttpProcessManagerService
    ]
})
export class ProcessModule { }
