import {Component} from "@angular/core";
import JsonApiDocumentBuilder from "../../server/jsonapi/JsonApiBuilder";
import {AuthProvider} from "./auth-provider.service";
import {ConfigurationService} from "./util/configuration-service";

@Component({
    selector: 'auth-guard',
    template: require('./auth-guard.component.html')
})
export class AuthGuardComponent {

    private username: string;
    private password: string;

    private error: string = '';

    public constructor(private authProvider: AuthProvider, private configService: ConfigurationService) { }

    private login() {
        const requestData = new JsonApiDocumentBuilder();
        const requestResource = requestData.getResourceBuilder();
        requestResource.resource.type = 'user';
        requestResource.resource.attributes = {
            username: this.username,
            password: this.password
        };
        requestData.addResource(requestResource.getProduct());

        return this.authProvider.login(this.username, this.password)
            .then(response => {
                this.error = '';
                this.username = '';
                this.password = '';
            })
            .catch(err => {
                if (err.status === 500)
                    this.error = "Could not process log in";
                else if (err.status === 401)
                    this.error = "Wrong username or password";
            });
    }
}
