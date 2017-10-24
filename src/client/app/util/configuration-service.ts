
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class ConfigurationService {

    private _config;

    public get config () {
        return this._config;
    }

    public constructor (private http: HttpClient) { }

    public refreshConfig () {
        return this.http.get('/api/config').toPromise()
            .then(response => {
                this._config = response['data'].attributes;
                return null;
            });
    }
}

/**
 * Function used by the AppModule to inital the configuration service.
 * This makes sure the configuration is loaded before any UI components are shown
 * @param {ConfigurationService} configService
 * @returns {() => Promise<any>}
 */
export default function initConfigurationService (configService: ConfigurationService) {
    return () => configService.refreshConfig();
}
