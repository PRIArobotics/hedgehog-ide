import {Http, Headers} from "@angular/http";
import {Injectable} from "@angular/core";

@Injectable()
export class HttpHedgehogClientService {

    private headers = new Headers({'Content-Type': 'application/vnd.api+json'});

    public constructor (private http: Http) { }

    public async getSensorValue (port: number) {
        // send get request for specific sensor value
        return this.http
            .get(`/api/sensors/${port}`)
            .toPromise()
            .then(response => {
                return response.json().data.attributes.value;
            });
    }

    public async getSensorList () {
        // send get request for a list of all sensors containing their values
        return this.http
            .get(`/api/sensors`)
            .toPromise()
            .then(response => {
                return response.json();
            });
    }

    public async setSensorPullup (port: number, pullup: boolean) {
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
        return this.http
            .patch(`/api/sensor/${port}`,
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
        return this.http
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
        return this.http
            .patch(`/api/servos/${port}`,
                JSON.stringify(servoData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }
}
