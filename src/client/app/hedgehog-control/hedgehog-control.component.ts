import {Component, ChangeDetectorRef, AfterViewInit, OnDestroy} from '@angular/core';
import {HttpHedgehogClientService} from "./http-hedgehog-client.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'hedgehog-control',
    template: require('./hedgehog-control.component.html'),
    styles: [require('./hedgehog-control.component.css')]
})

export default class HedgehogControlComponent implements AfterViewInit, OnDestroy {
    public motorControls: Array<{value: number, state: boolean}> = [];
    public servoControls: Array<{value: number, state: boolean}> = [];

    public analogSensors: Array<{dataset: number[], labels: string[]}> = [];
    public digitalSensors: Array<{dataset: number[], labels: string[]}> = [];

    private sensorSubscription: Subscription;

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

        [0, 1, 2, 3, 4, 5, 6, 7].forEach(() => {
            this.digitalSensors.push({
                dataset: [],
                labels: []
            });
        });

        this.sensorSubscription = this.hedgehogClient.onSensorValues()
            .subscribe(async sensorData => {
                for (let sensor of sensorData) {
                    let dataset: any[];
                    let labels: string[];

                    let value = sensor.value;

                    if (sensor.type === "analog") {
                        dataset = this.analogSensors[sensor.id % 8].dataset;
                        labels = this.analogSensors[sensor.id % 8].labels;
                    } else if (sensor.type === "digital") {
                        dataset = this.digitalSensors[sensor.id % 8].dataset;
                        labels = this.digitalSensors[sensor.id % 8].labels;
                        value = value ? 1 : 0;
                    }

                    dataset.push(value);
                    labels.push('');

                    if (dataset.length > 50) {
                        dataset.shift();
                        labels.shift();
                    }
                }
                ref.markForCheck();
            });
    }

    public ngOnDestroy(): void {
        this.sensorSubscription.unsubscribe();
    }

    public ngAfterViewInit(): void {
        ($('#tabs') as any).tabs();
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
