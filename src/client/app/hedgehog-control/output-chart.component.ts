import {Component, Input, ViewChild, DoCheck, IterableDiffers, OnInit, EventEmitter, Output} from '@angular/core';
import {BaseChartDirective} from "ng2-charts/ng2-charts";

@Component({
    selector: 'output-chart',
    template: require('./output-chart.component.html')
})
export default class OutputChartComponent implements DoCheck, OnInit {

    @ViewChild(BaseChartDirective)
    public chart: BaseChartDirective;

    @Input() public name: string;
    @Input() public lineData: number[] = [0];
    @Input() public lineLabels: string[] = [];
    @Input() public type: string;

    public lineOptions: any = {
        responsive: true,
        animation: false,
        scales: {
            yAxes: [{
                // ticks filled dynamically
            }],
            xAxes: [{
                display: false
            }]
        }
    };

    public lineChartColors = [
        { // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];

    @Output() private pullupChanged = new EventEmitter();

    // From: http://stackoverflow.com/questions/36247016/angular2-refreshing-view-on-array-push
    private differ: any;

    public constructor (differs: IterableDiffers) {
        this.differ = differs.find([]).create(null);
    }

    public ngDoCheck () {
        if (this.differ.diff(this.lineData))
            this.chart.chart.update();
    }


    public ngOnInit (): void {
        if (this.type === "digital") {
            this.lineOptions.scales.yAxes[0].ticks = {
                stepSize: 1,
                min: 0,
                max: 1,
            };
        } else {
            this.lineOptions.scales.yAxes[0].ticks = {
                stepSize: 512,
                min: 0,
                max: 4096,
            };
        }
    }

    private updatePullup (pullup: boolean) {
        this.pullupChanged.emit(pullup);
    }
}
