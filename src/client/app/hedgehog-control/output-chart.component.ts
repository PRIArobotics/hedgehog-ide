import {Component, Input, ViewChild, OnInit, SimpleChanges, OnChanges, DoCheck, IterableDiffers} from '@angular/core';
import {BaseChartDirective} from "ng2-charts/ng2-charts";

@Component({
    selector: 'output-chart',
    template: require('./output-chart.component.html'),
    styles: [require('./output-chart.component.css')]
})
export default class OutputChartComponent implements DoCheck {

    @ViewChild(BaseChartDirective) public chart: BaseChartDirective;

    @Input() public name: string;
    @Input() public lineData: number[] = [0];
    @Input() public lineLabels: string[] = [];

    public lineOptions = {
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

    private differ: any;

    public constructor (differs: IterableDiffers) {
        this.differ = differs.find([]).create(null);
    }


    public ngOnInit(): void {
        /*setInterval(() => {
            this.updateChart();
        }, 1000);*/
    }

    /*public ngOnChanges(changes: SimpleChanges) {
         console.log(changes['lineData']);
    }*/

    public ngDoCheck () {
        if (this.differ.diff(this.lineData)) {
            console.log('update');
            console.log(this.lineData);
            this.chart.ngOnChanges({});
        }
    }

    private updateChart() {
        //this.chart.ngOnChanges({});
    }
}
