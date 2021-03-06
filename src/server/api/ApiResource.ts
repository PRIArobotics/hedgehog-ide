import path = require('path');
import {ServerRoute} from "hapi";

abstract class ApiResource {
    private endpoints: ServerRoute[];

    public constructor(public pathPrefix = '') { }

    public addEndpoint(path, method, handler) { // tslint:disable-line:no-shadowed-variable
        if(!this.endpoints)
            this.endpoints = [];

        this.endpoints.push({
            path,
            method,
            handler
        });
    }

    public getEndpoints() {
        return this.endpoints.map(endpoint => {
            return {
                path: path.join(this.pathPrefix, endpoint.path),
                method: endpoint.method,
                handler: endpoint.handler
            };
        });
    }
}
export default ApiResource;
