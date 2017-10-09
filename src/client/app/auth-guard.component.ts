import {Component} from "@angular/core";
import JsonApiDocumentBuilder from "../../server/jsonapi/JsonApiBuilder";
import {Http, Headers} from "@angular/http";

@Component({
    selector: 'auth-guard',
    template: require('./auth-guard.component.html')
})
export class AuthGuardComponent {
    private token: string = sessionStorage.getItem('auth-token');

    private username: string;
    private password: string;

    private error: string = '';

    public constructor(private http: Http) { }

    private login() {
        const requestData = new JsonApiDocumentBuilder();
        const requestResource = requestData.getResourceBuilder();
        requestResource.resource.type = 'user';
        requestResource.resource.attributes = {
            username: this.username,
            password: this.password
        };
        requestData.addResource(requestResource.getProduct());

        console.log(requestData.getProduct());

        return this.http
            .post('/api/auth/login',
                JSON.stringify(requestData.getProduct()),
                {headers: new Headers({'Content-Type': 'application/vnd.api+json'})})
            .toPromise()
            .then(response => {
                this.error = '';

                this.token = response.json().token;
                sessionStorage.setItem('auth-token', this.token);
            })
            .catch(err => {
                console.log(err);
                if (err.status === 500)
                    this.error = "Could not process log in";
                else if (err.status === 401)
                    this.error = "Wrong username or password";
            });
    }
}
