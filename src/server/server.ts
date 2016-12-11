import Hapi = require('hapi');
import path = require('path');
import Api from "./api/Api";
import ProgramsResource from "./api/resource/versioncontrol/ProgramsResource";

// Create a server with a host and port
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, '..')
            }
        }
    }
});
server.connection({
    host: 'localhost',
    port: 8000
});

// tslint:disable-next-line
server.register(require('inert'));

server.route({
    method: 'GET',
    path: '/node_modules/{param*}',
    handler: {
        directory: {
            path: '../../node_modules',
            redirectToSlash: true
        }
    }
});

server.route({
    method: 'GET',
    path: '/common/{param*}',
    handler: {
        directory: {
            path: 'common',
            redirectToSlash: true
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'client',
            redirectToSlash: true,
            index: true
        }
    }
});

server.ext('onPreResponse', (request, reply) => {
    if (request.response.isBoom) {
        return reply.file(path.join(__dirname, '../client/index.html'));
    }

    return reply.continue();
});

let hedgehogApi = new Api(server, '/api');
hedgehogApi.registerEndpoint(new ProgramsResource('.'));

// Start the server
server.start((err) => {

    if (err)
        throw err;

    console.log('Server running at:', server.info.uri);
});
