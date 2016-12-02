import Hapi = require('hapi');
import path = require('path');

export default class HapiApi {

    public constructor(private server: Hapi.Server,
                       private prefix: string) { }

    public apiEndpoint(endpointPath, method) {
        return (target: any, handlerName: string) => {
            this.server.route({
                path: path.join(this.prefix, endpointPath),
                method,
                handler: target[handlerName].bind(target)
            });
        };
    }
}
