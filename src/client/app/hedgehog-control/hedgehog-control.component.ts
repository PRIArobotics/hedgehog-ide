import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {HttpHedgehogClientService, VisionChannelKind} from "./http-hedgehog-client.service";
import {Subscription} from "rxjs";
import {RGB, HSV, HSVRange} from './vision-control.component';

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

    public channel: VisionChannelKind = VisionChannelKind.RAW;
    public blobsRange: HSVRange = [[70/255, 20/255, 20/255], [90/255, 255/255, 234/255]];
    public frameUrl: SafeUrl = null;
    private blobUrl: string = null;

    private sensorSubscription: Subscription;
    private visionSubscription: Subscription;

    constructor (
        private hedgehogClient: HttpHedgehogClientService,
        private ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer
    ) {
        [0, 1, 2, 3].forEach(() => {
            this.motorControls.push({
                value: 0,
                state: false
            });
        });

        [0, 1, 2, 3, 4, 5].forEach(() => {
            this.servoControls.push({
                value: 500,
                state: false
            });
        });

        for (let i = 0; i < 16; i++) {
            this.analogSensors.push({
                dataset: Array(50).fill(NaN),
                labels: Array(50).fill('')
            });
            this.digitalSensors.push({
                dataset: Array(50).fill(NaN),
                labels: Array(50).fill('')
            });
        }

        this.sensorSubscription = this.hedgehogClient.onSensorValues()
            .subscribe(async sensorData => {
                for (let sensor of sensorData) {
                    let dataset: any[];

                    let value = sensor.value;

                    if (sensor.type === "analog") {
                        dataset = this.analogSensors[sensor.id].dataset;
                    } else if (sensor.type === "digital") {
                        dataset = this.digitalSensors[sensor.id].dataset;
                        value = value ? 1 : 0;
                    }

                    dataset.push(value);
                    dataset.shift();
                }
                ref.markForCheck();
            });
        this.visionSubscription = this.hedgehogClient.onVisionFrames(VisionChannelKind.RAW)
            .subscribe(frame => this.onVisionFrame(frame));
    }

    public ngOnDestroy(): void {
        this.sensorSubscription.unsubscribe();
        this.visionSubscription.unsubscribe();
        if (this.blobUrl !== null) {
            URL.revokeObjectURL(this.blobUrl);
            this.blobUrl = null;
        }
    }

    public ngAfterViewInit(): void {
        ($('#tabs') as any).tabs();
    }

    public async updateMotorValue(port: number, value: number) {
        this.motorControls[port].value = value;

        if (this.motorControls[port].state) {
            await this.hedgehogClient.setMotor(port, value);
        }
    }

    public async updateMotorState(port: number, state) {
        this.motorControls[port].state = state;

        await this.hedgehogClient.setMotor(port, state ? this.motorControls[port].value : 0);
    }

    public async updateServoValue(port: number, value: number) {
        this.servoControls[port].value = value;

        if (this.servoControls[port].state) {
            await this.hedgehogClient.setServo(port, value);
        }
    }

    public async updateServoState(port: number, state) {
        this.servoControls[port].state = state;
        await this.hedgehogClient.setServo(port, this.servoControls[port].value, state);
    }

    public async updateSensorPullup(port: number, pullup) {
        await this.hedgehogClient.setInputState(port, pullup);
    }

    public onVisionFrame(frame): void {
        if (this.blobUrl !== null) {
            URL.revokeObjectURL(this.blobUrl);
        }

        let blob = new Blob([frame], {type: "image/jpg"});
        this.blobUrl = URL.createObjectURL(blob);
        this.frameUrl = this.sanitizer.bypassSecurityTrustUrl(this.blobUrl);
    }

    public updateVisionChannel(channel: VisionChannelKind): void {
        let newSubscription = this.hedgehogClient.onVisionFrames(channel)
            .subscribe(frame => this.onVisionFrame(frame));
        this.visionSubscription.unsubscribe();
        this.visionSubscription = newSubscription;
        this.channel = channel;
    }

    public updateVisionBlobsRange(blobsRange: HSVRange): void {
        this.blobsRange = blobsRange;
        let [hsvMin, hsvMax] = blobsRange;

        // tslint:disable-next-line no-bitwise
        const bits = (x, shift) => Math.round(x*255) << shift;
        // tslint:disable-next-line no-bitwise
        const pack = ([h, s, v]) => bits(h, 16) | bits(s, 8) | bits(v, 0);

        this.hedgehogClient.setVisionBlobsRange(pack(hsvMin), pack(hsvMax));
    }
}
