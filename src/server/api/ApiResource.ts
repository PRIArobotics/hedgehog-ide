import Hapi = require('hapi');

abstract class ApiResource {
    private endpoints: Hapi.IRouteConfiguration[];

    public addEndpoint(path, method, handler) {
        if(!this.endpoints)
            this.endpoints = [];

        this.endpoints.push({
            path,
            method,
            handler
        });
    }

    public getEndpoints() {
        return this.endpoints;
    }
}
export default ApiResource;
