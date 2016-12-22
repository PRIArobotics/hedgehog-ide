import "babel-polyfill";
import Hapi = require('hapi');
import path = require('path');
import Api from "./api/Api";
import ProgramResource from "./api/resource/versioncontrol/ProgramResource";
import GitProgramStorage from "./versioncontrol/GitProgramStorage";
import modelRegistry from "./jsonapi/ModelSerializerRegistry";
import winston = require("winston");

/**
 * Logger setup
 * We use one global logger instance for logging
 */
winston.configure({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            prettyPrint: true
        })
    ]
});


/**
 * Server setup
 */
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

/**
 * API setup
 */
let hedgehogApi = new Api(server, '/api');
hedgehogApi.registerEndpoint(new ProgramResource(new GitProgramStorage('tmp'), modelRegistry));

// tslint:disable-next-line
server.register(require('inert'));

/**
 * Static resources (Angular webapp)
 */
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

/**
 * Handler for 404 which also serves the Angular webapp
 * (This enables routing within the real path section)
 */
server.ext('onPreResponse', (request, reply) => {
    let response = <any> request.response;
    if (request.response.isBoom && (response.output.statusCode === 404)) {
        return reply.file(path.join(__dirname, '../client/index.html'));
    }

    return reply.continue();
});


/**
 * Run server
 */
server.start((err) => {

    if (err)
        throw err;

    console.log('Server running at:', server.info.uri);
});
