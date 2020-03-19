import {Injectable} from "@angular/core";
import JsonApiDocumentBuilder from "../../server/jsonapi/JsonApiBuilder";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable()
export class AuthProvider {
    private _token: string = sessionStorage.getItem('auth-token');

    public get token () {
        return this._token;
    }

    constructor (private httpClient: HttpClient) { }

    public login (username: string, password: string) {
        const requestData = new JsonApiDocumentBuilder();
        const requestResource = requestData.getResourceBuilder();
        requestResource.resource.type = 'user';
        requestResource.resource.attributes = {
            username,
            password
        };
        requestData.addResource(requestResource.getProduct());

        return this.httpClient
            .post('/api/auth/login',
                JSON.stringify(requestData.getProduct()),
                {headers: new HttpHeaders({'Content-Type': 'application/vnd.api+json'})})
            .toPromise()
            .then((json: any) => {
                this._token = json.data.attributes.token;
                sessionStorage.setItem('auth-token', this._token);
            });
    }

    public invalidateToken () {
        this._token = null;
        sessionStorage.removeItem('auth-token');
    }
}
