import { Component } from '@angular/core';
import {HttpHedgehogClientService} from "./http-hedgehog-client.service";

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

    constructor (private hedgehogClient: HttpHedgehogClientService) {
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
                dataset: [0],
                labels: []
            });
        });

        [0, 1, 2 , 3, 4, 5, 6, 7].forEach(() => {
            this.digitalSensors.push({
                dataset: [0],
                labels: []
            });
        });

        setInterval(async () => {
            let sensorList = await this.hedgehogClient.getSensorList();

            for (let sensorData of sensorList.data) {
                if (sensorData.attributes.type === "analog") {
                    this.analogSensors[+sensorData.id % 8].dataset.push(sensorData.attributes.value);
                } else if (sensorData.attributes.type === "digital") {
                    this.digitalSensors[+sensorData.id % 8].dataset.push(sensorData.attributes.value ? 1 : 0);
                }
            }

        }, 1000);
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
