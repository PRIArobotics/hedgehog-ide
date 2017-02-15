import { Component } from '@angular/core';
import {HttpHedgehogClientService} from "./http-hedgehog-client.service";

@Component({
    selector: 'hedgehog-control',
    template: require('./hedgehog-control.component.html')
})

export default class HedgehogControlComponent {
    public motorControls: Array<{value: number, state: boolean}> = [];
    public servoControls: Array<{value: number, state: boolean}> = [];

    constructor (private hedgehogClient: HttpHedgehogClientService) {
        [0,1,2,3].forEach(() => {
            this.motorControls.push({
                value: 0,
                state: false
            });
        });

        [0,1,2,3].forEach(() => {
            this.servoControls.push({
                value: 0,
                state: false
            });
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

        if (state) {
            this.hedgehogClient.setMotor(port, this.motorControls[port].value);
        } else {
            this.hedgehogClient.setMotor(port, 0);
        }
    }

    private updateServoValue(port: number, value: number) {
        this.servoControls[port].value = value;

        if (this.servoControls[port].state) {
            this.hedgehogClient.setMotor(port, value);
        }
    }

    private updateServoState(port: number, state) {
        this.servoControls[port].state = state;

        if (state) {
            this.hedgehogClient.setMotor(port, this.servoControls[port].value);
        } else {
            this.hedgehogClient.setMotor(port, 0);
        }
    }
}
