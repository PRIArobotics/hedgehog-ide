import {Component, OnInit} from "@angular/core";
import JsonApiDocumentBuilder from "../../server/jsonapi/JsonApiBuilder";
import {AuthProvider} from "./auth-provider.service";
import {ConfigurationService} from "./util/configuration-service";

@Component({
    selector: 'auth-guard',
    template: require('./auth-guard.component.html')
})
export class AuthGuardComponent implements OnInit {

    private username: string;
    private password: string;

    private error: string = '';

    private config = null;

    public constructor(private authProvider: AuthProvider, private configService: ConfigurationService) { }

    public async ngOnInit() {
        this.config = await this.configService.getConfig();
    }

    private login() {
        const requestData = new JsonApiDocumentBuilder();
        const requestResource = requestData.getResourceBuilder();
        requestResource.resource.type = 'user';
        requestResource.resource.attributes = {
            username: this.username,
            password: this.password
        };
        requestData.addResource(requestResource.getProduct());

        this.username = '';
        this.password = '';

        return this.authProvider.login(this.username, this.password)
            .then(response => {
                this.error = '';
            })
            .catch(err => {
                if (err.status === 500)
                    this.error = "Could not process log in";
                else if (err.status === 401)
                    this.error = "Wrong username or password";
            });
    }
}
