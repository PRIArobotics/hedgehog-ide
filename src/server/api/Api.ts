import path = require('path');
import ApiResource from "./ApiResource";
import {Lifecycle, Server} from "hapi";

export default class Api {
    public constructor(private server: Server,
                       private prefix: string) { }

    public registerResource(resource: ApiResource, auth: string | false = null) {
        for(let endpoint of resource.getEndpoints()) {
            this.server.route({
                path: path.join(this.prefix, endpoint.path),
                method: endpoint.method,
                handler: (endpoint.handler as Lifecycle.Method).bind(resource),
                options: auth === null ? { } : { auth }
            });
        }
    }
}
