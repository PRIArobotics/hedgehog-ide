import "babel-polyfill";
import Hapi = require('hapi');
import Io = require('socket.io');
import path = require('path');
import winston = require("winston");
import chalk = require('chalk');
import figlet = require('figlet');

import Api from "./api/Api";
import ProgramResource from "./api/resource/versioncontrol/ProgramResource";
import GitProgramStorage from "./versioncontrol/GitProgramStorage";
import modelRegistry from "./jsonapi/ModelSerializerRegistry";
import WorkingTreeFileResource from "./api/resource/versioncontrol/WorkingTreeFileResource";
import WorkingTreeDirectoryResource from "./api/resource/versioncontrol/WorkingTreeDirectoryResource";
import ProcessResource from "./api/resource/ProcessResource";
import SocketIoProcessAdapter from "./process/SocketIoProcessAdapter";
import NodeProcessManager from "./process/NodeProcessManager";
import BlobResource from "./api/resource/versioncontrol/BlobResource";

// Return external module as the file is outside of the
// TypeScript compile output
// tslint:disable-next-line
let serverConfig = require('../../../config/server.config');


console.log(chalk.green(figlet.textSync('Hedgehog IDE')));

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
winston.level = 'debug';


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

server.connection(serverConfig.connection);

/**
 * API setup
 */
let programStorage = new GitProgramStorage(serverConfig.programStorageDirectory);
let processManager = new NodeProcessManager(
    serverConfig.process.temporaryStorageDirectory,
    serverConfig.process.pythonPath,
    programStorage
);

let hedgehogApi = new Api(server, '/api');
hedgehogApi.registerEndpoint(new ProgramResource(programStorage, modelRegistry));
hedgehogApi.registerEndpoint(new WorkingTreeFileResource(programStorage, modelRegistry));
hedgehogApi.registerEndpoint(new WorkingTreeDirectoryResource(programStorage, modelRegistry));
hedgehogApi.registerEndpoint(new BlobResource(programStorage, modelRegistry));
hedgehogApi.registerEndpoint(new ProcessResource(processManager, modelRegistry));

/**
 * Socket.io setup
 */
let io = Io(server.listener);
new SocketIoProcessAdapter(processManager, io);

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
 * Print routes for debugging
 */
winston.debug(chalk.underline.cyan('Routes'));
for(const route of (<any>server.connections[0]).table()) {
    winston.debug(`- ${route.method} ${route.path}`);
}

/**
 * Run server
 */
server.start((err) => {

    if (err)
        throw err;

    winston.info('Server running at:', server.info.uri);
});
