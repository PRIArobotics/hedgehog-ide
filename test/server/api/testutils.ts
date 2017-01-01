import Hapi = require('hapi');

import ApiResource from "../../../src/server/api/ApiResource";
import Api from "../../../src/server/api/Api";

export function setupApiServer(...resources: ApiResource[]) {
    let server = new Hapi.Server();
    server.connection({
        host: 'localhost',
        port: 61749
    });

    let api = new Api(server, '/api');
    for(const resource of resources) {
        api.registerEndpoint(resource);
    }
    return server;
}