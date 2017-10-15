import Hapi = require('hapi');
import path = require('path');
import ApiResource from "./ApiResource";
import {ISessionHandler} from "hapi";

export default class Api {
    public constructor(private server: Hapi.Server,
                       private prefix: string) { }

    public registerResource(resource: ApiResource, auth: string | boolean = null) {
        for(let endpoint of resource.getEndpoints()) {
            this.server.route({
                path: path.join(this.prefix, endpoint.path),
                method: endpoint.method,
                handler: (endpoint.handler as ISessionHandler).bind(resource),
                config: auth === null ? { } : { auth }
            });
        }
    }
}
