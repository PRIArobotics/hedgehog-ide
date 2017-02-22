import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

import {ChartsModule} from "ng2-charts/ng2-charts";

import HedgehogControlComponent from "./hedgehog-control.component";
import OutputControlComponent from "./output-control.component";
import {HttpHedgehogClientService} from "./http-hedgehog-client.service";
import OutputChartComponent from "./output-chart.component";
require("chart.js");

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartsModule
    ],
    declarations: [
        HedgehogControlComponent,
        OutputControlComponent,
        OutputChartComponent
    ],
    providers: [
        HttpHedgehogClientService
    ]
})

export class HedgehogControlModule { }
