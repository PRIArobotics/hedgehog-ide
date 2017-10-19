import {Injectable} from "@angular/core";
import JsonApiDocumentBuilder from "../../server/jsonapi/JsonApiBuilder";
import {Http, Headers} from "@angular/http";

@Injectable()
export class AuthProvider {
    private _token: string = sessionStorage.getItem('auth-token');

    public get token () {
        return this._token;
    }

    constructor (private http: Http) { }

    public login (username: string, password: string) {
        const requestData = new JsonApiDocumentBuilder();
        const requestResource = requestData.getResourceBuilder();
        requestResource.resource.type = 'user';
        requestResource.resource.attributes = {
            username,
            password
        };
        requestData.addResource(requestResource.getProduct());

        return this.http
            .post('/api/auth/login',
                JSON.stringify(requestData.getProduct()),
                {headers: new Headers({'Content-Type': 'application/vnd.api+json'})})
            .toPromise()
            .then(response => {
                this._token = response.json().data.attributes.token;
                sessionStorage.setItem('auth-token', this._token);
            });
    }
}
