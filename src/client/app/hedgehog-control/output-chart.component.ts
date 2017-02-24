import {Component, Input, ViewChild, DoCheck, IterableDiffers, OnInit} from '@angular/core';
import {BaseChartDirective} from "ng2-charts/ng2-charts";

@Component({
    selector: 'output-chart',
    template: require('./output-chart.component.html'),
    styles: [require('./output-chart.component.css')]
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
                ticks: {
                    beginAtZero:true
                }
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

    // From: http://stackoverflow.com/questions/36247016/angular2-refreshing-view-on-array-push
    private differ: any;

    public constructor (differs: IterableDiffers) {
        this.differ = differs.find([]).create(null);
    }

    public ngDoCheck () {
        if (this.differ.diff(this.lineData))
            this.chart.chart.update();
    }


    public ngOnInit(): void {
        if (this.type === "digital") {
            this.lineOptions.scales.yAxes[0].ticks.stepSize = 1;
        }
    }
}
