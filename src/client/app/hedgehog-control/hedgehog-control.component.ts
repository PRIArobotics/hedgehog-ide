import {Component, ChangeDetectorRef} from '@angular/core';
import {HttpHedgehogClientService} from "./http-hedgehog-client.service";
import {Observable} from "rxjs";

@Component({
    selector: 'hedgehog-control',
    template: require('./hedgehog-control.component.html'),
    styles: [require('./hedgehog-control.component.css')]
})

export default class HedgehogControlComponent {
    public motorControls: Array<{value: number, state: boolean}> = [];
    public servoControls: Array<{value: number, state: boolean}> = [];

    public analogSensors: Array<{dataset: number[], labels: string[]}> = [];
    public digitalSensors: Array<{dataset: number[], labels: string[]}> = [];

    constructor (private hedgehogClient: HttpHedgehogClientService, ref: ChangeDetectorRef) {
        [0, 1, 2, 3].forEach(() => {
            this.motorControls.push({
                value: 0,
                state: false
            });
        });

        [0, 1, 2, 3].forEach(() => {
            this.servoControls.push({
                value: 0,
                state: false
            });
        });

        [0, 1, 2, 3, 4, 5, 6, 7].forEach(() => {
            this.analogSensors.push({
                dataset: [],
                labels: []
            });
        });

        [0, 1, 2 , 3, 4, 5, 6, 7].forEach(() => {
            this.digitalSensors.push({
                dataset: [],
                labels: []
            });
        });

        Observable.interval(1000)
            .subscribe(async () => {
                let sensorList = await this.hedgehogClient.getSensorList();

                for (let sensorData of sensorList.data) {
                    let dataset: any[];
                    let labels: string[];

                    let value = sensorData.attributes.value;

                    if (sensorData.attributes.type === "analog") {
                        dataset = this.analogSensors[+sensorData.id % 8].dataset;
                        labels = this.analogSensors[+sensorData.id % 8].labels;
                    } else if (sensorData.attributes.type === "digital") {
                        dataset = this.digitalSensors[+sensorData.id % 8].dataset;
                        labels = this.digitalSensors[+sensorData.id % 8].labels;
                        value = value ? 1 : 0;
                    }

                    dataset.push(value);
                    labels.push('');

                    if (dataset.length > 10) {
                        dataset.shift();
                        labels.shift();
                    }
                }
                ref.markForCheck();
            });
    }

    private updateMotorValue(port: number, value: number) {
        this.motorControls[port].value = value;

        if (this.motorControls[port].state) {
            this.hedgehogClient.setMotor(port, value);
        }
    }

    private updateMotorState(port: number, state) {
        this.motorControls[port].state = state;


        this.hedgehogClient.setMotor(port, state ? this.motorControls[port].value : 0);
    }

    private updateServoValue(port: number, value: number) {
        this.servoControls[port].value = value;

        if (this.servoControls[port].state) {
            this.hedgehogClient.setServo(port, value);
        }
    }

    private updateServoState(port: number, state) {
        this.servoControls[port].state = state;
        this.hedgehogClient.setServo(port, this.servoControls[port].value, state);
    }
}
