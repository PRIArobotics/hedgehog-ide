import {Component, Input, ViewChild, OnInit} from '@angular/core';
import {BaseChartDirective} from "ng2-charts/ng2-charts";

@Component({
    selector: 'output-chart',
    template: require('./output-chart.component.html'),
    styles: [require('./output-chart.component.css')]
})
export default class OutputChartComponent implements OnInit {

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


    public ngOnInit(): void {
        setInterval(() => {
            this.updateChart();
        }, 1000);
    }

    private updateChart() {
        this.chart.ngOnChanges({});

    }
}
