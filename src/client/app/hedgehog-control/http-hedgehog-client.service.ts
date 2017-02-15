import {Http, Headers} from "@angular/http";
import {Injectable} from "@angular/core";

@Injectable()
export class HttpHedgehogClientService {

    private headers = new Headers({'Content-Type': 'application/vnd.api+json'});

    public constructor (private http: Http) { }

    public async getSensorValue (port: number) {
        // send get request for the version ids
        return this.http
            .get(`/api/sensors/${port}`)
            .toPromise()
            .then(response => {
                // create new Tree Instance
                return response.json().data.attributes.value;
            });
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

        console.log(port, power)

        // send post request with headers (json) and the stringifyed data object
        return this.http
            .patch(`/api/motors/${port}`,
                JSON.stringify(motorData),
                {headers: this.headers})
            .toPromise()
            .then(() => Promise.resolve());
    }

    public async setServo (port: number, power: number) {
        // create motor data object using the given parameters
        let motorData = {
            data: {
                id: port,
                type: 'servo',
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
}
