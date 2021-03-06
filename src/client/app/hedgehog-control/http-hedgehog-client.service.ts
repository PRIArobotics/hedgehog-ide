import io = require('socket.io-client');

import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AuthProvider} from "../auth-provider.service";

export enum VisionChannelKind {
    RAW,
    FACES,
    BLOBS,
}

@Injectable()
export class HttpHedgehogClientService {

    private headers = new HttpHeaders({'Content-Type': 'application/vnd.api+json'});

    public constructor (private httpClient: HttpClient, private authProvider: AuthProvider) { }

    public async getVersion () {
        return this.httpClient
            .get(`/api/version`)
            .toPromise()
            .then((json: any) => {
                return json.data.attributes;
            });
    }

    public async getEmergencyStop () {
        return this.httpClient
            .get(`/api/emergency`)
            .toPromise()
            .then((json: any) => {
                return json.data.attributes.active;
            });
    }

    public async setEmergencyStop (activate: boolean) {
        // create emergency data object using the given parameters
        let emergencyData = {
            data: {
                id: 0,
                type: 'emergency',
                attributes: {
                    activate
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.httpClient
            .patch(`/api/emergency`,
                JSON.stringify(emergencyData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }

    public async getSensorValue (port: number) {
        // send get request for specific sensor value
        return this.httpClient
            .get(`/api/sensors/${port}`)
            .toPromise()
            .then((json: any) => {
                return json.data.attributes.value;
            });
    }

    public async getSensorList () {
        // send get request for a list of all sensors containing their values
        return this.httpClient
            .get(`/api/sensors`)
            .toPromise()
            .then((json: any) => {
                return json;
            });
    }

    public async setInputState (port: number, pullup: boolean) {
        // create sensor data object using the given parameters
        let sensorData = {
            data: {
                id: port,
                type: 'sensor',
                attributes: {
                    pullup
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.httpClient
            .patch(`/api/sensors/${port}`,
                JSON.stringify(sensorData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }

    public async getSensorValues () {
        let values: number[] = [];
        let sensorlist = await this.getSensorList();
        for (let sensor of sensorlist.data) {
            values.push(sensor.attributes.value);
        }

        return values;
    }

    public async setMotor (port: number, power: number) {
        // create motor data object using the given parameters
        let motorData = {
            data: {
                id: port,
                type: 'motor',
                attributes: {
                    power,
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.httpClient
            .patch(`/api/motors/${port}`,
                JSON.stringify(motorData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }

    public async setServo (port: number, position: number, enabled: boolean = true) {
        // create sensor data object using the given parameters
        let servoData = {
            data: {
                id: port,
                type: 'servo',
                attributes: {
                    enabled,
                    position,
                }
            }
        };

        // send post request with headers (json) and the stringifyed data object
        return this.httpClient
            .patch(`/api/servos/${port}`,
                JSON.stringify(servoData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }

    public onSensorValues (): Observable<Array<{id: number, type: string, value: number}>> {
        const host = `${document.location.protocol}//${document.location.hostname}:${document.location.port}`;
        let socket = io(host + '/sensors', {query: {jwtToken: this.authProvider.token}});

        return Observable.fromEventPattern(
            cb => {
                socket.on('data', cb);
            },
            cb => {
                socket.close();
                cb();
            }
        );
    }

    public setVisionBlobsRange (hsvMin: number, hsvMax: number): Promise<void> {
        return new Promise(resolve => {
            const host = `${document.location.protocol}//${document.location.hostname}:${document.location.port}`;

            let socket = io(`${host}/vision-blobs-range`, {query: {jwtToken: this.authProvider.token}});

            socket.on('connect', () => {
                socket.emit('data', hsvMin, hsvMax);
                socket.disconnect();
                resolve();
            });
        });
    }

    public onVisionFrames (channel: VisionChannelKind): Observable<Uint8Array> {
        const host = `${document.location.protocol}//${document.location.hostname}:${document.location.port}`;

        let ns;
        switch (channel) {
            case VisionChannelKind.FACES:
                ns = 'vision-faces';
                break;
            case VisionChannelKind.BLOBS:
                ns = 'vision-blobs';
                break;
            default:
                ns = 'vision';
        }

        let socket = io(`${host}/${ns}`, {query: {jwtToken: this.authProvider.token}});

        return Observable.fromEventPattern(
            cb => {
                socket.on('data', cb);
            },
            cb => {
                socket.close();
                cb();
            }
        );
    }

    public onEmergencyStop (): Observable<{active: boolean}> {
        const host = `${document.location.protocol}//${document.location.hostname}:${document.location.port}`;
        let socket = io(host + '/emergency', {query: {jwtToken: this.authProvider.token}});

        return Observable.fromEventPattern(
            cb => {
                socket.on('data', cb);
            },
            cb => {
                socket.close();
                cb();
            }
        );
    }
}
