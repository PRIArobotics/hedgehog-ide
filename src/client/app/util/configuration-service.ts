
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class ConfigurationService {

    private config;

    public constructor (private http: HttpClient) { }

    public async getConfig (): Promise<any> {
        if (!this.config)
            await this.refreshConfig();

        return this.config;
    }

    public refreshConfig () {
        return this.http.get('/api/config').toPromise()
            .then(response => {
                this.config = response['data'].attributes;
                return null;
            });
    }
}
