import "babel-polyfill";
import Io = require('socket.io');
import path = require('path');
import winston = require("winston");
import figlet = require('figlet');
import jwt = require('jsonwebtoken');
import chalk from "chalk";
import {Server, Request, ResponseToolkit} from "hapi";

import {HedgehogClient} from 'hedgehog-client';

import Api from "./api/Api";
import GitProgramStorage from "./versioncontrol/GitProgramStorage";
import registerResources from "./api/resource";
import SocketIoProcessAdapter from "./process/SocketIoProcessAdapter";
import NodeProcessManager from "./process/NodeProcessManager";
import SocketIoSensorAdapter from "./hedgehog-io/SocketIoSensorAdapter";
import SocketIoVisionAdapter from "./hedgehog-io/SocketIoVisionAdapter";
import SocketIoEmergencyAdapter from "./hedgehog-io/SocketIoEmergencyAdapter";
import ShareDbService from "./realtime-sync/ShareDbService";

import { shim as util_promisify_shim } from "util.promisify";
util_promisify_shim();

(async () => {
    try {
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
        winston.level = serverConfig.logging.level;

        /**
         * Model setup
         */
        let programStorage = new GitProgramStorage(serverConfig.programStorageDirectory);
        let hedgehog = new HedgehogClient(serverConfig.hedgehogConnection);
        let processManager = new NodeProcessManager(
            serverConfig.process.temporaryStorageDirectory,
            serverConfig.process.pythonPath,
            programStorage
        );

        /**
         * Server setup
         */
        // Create a server with a host and port
        const server = new Server({
            routes: {
                files: {
                    relativeTo: path.join(__dirname, '../..')
                }
            },
            host: serverConfig.connection.host,
            port: serverConfig.connection.port,
        });

        /**
         * API setup
         */
        if (serverConfig.auth.enabled) {
            // tslint:disable-next-line
            await server.register(require('hapi-auth-jwt2'));

            server.auth.strategy('jwt', 'jwt', {
                key: serverConfig.auth.jwtSecret,
                validate: (decoded, req, cb) => {
                    cb(null, decoded.exp >= Math.round(Date.now() / 1000));
                },
                verifyOptions: { algorithms: [ 'HS256' ] }
            });

            server.auth.default('jwt');
        }

        let hedgehogApi = new Api(server, '/api');
        registerResources(hedgehogApi, {serverConfig, hedgehog, processManager, programStorage});

        /**
         * Socket.io setup
         */
        let io = Io(server.listener);

        // Socket.io authentication
        if (serverConfig.auth.enabled) {
            io.use((socket, next) => {
                const handshake = socket.handshake;

                let decoded;
                try {
                    decoded = jwt.decode(handshake.query.jwtToken, serverConfig.auth.jwtSecret);
                } catch (err) {
                    winston.error(err);
                    next(new Error('Invalid token'));
                }

                if (decoded) {
                    if (decoded.exp >= Math.round(Date.now() / 1000))
                        next();
                    else
                        next(new Error('Expired token'));
                } else {
                    next(new Error('Invalid token'));
                }
            });
        }

        // tslint:disable
        new SocketIoProcessAdapter(processManager, io);
        new SocketIoSensorAdapter(hedgehog, io);
        new SocketIoVisionAdapter(hedgehog, io);
        new SocketIoEmergencyAdapter(hedgehog, io);

        /**
         * ShareDB backend
         */
        new ShareDbService(programStorage, io);
        await server.register(require('inert'));
        // tslint:enable

        /**
         * Static resources (Angular webapp)
         */
        server.route({
            method: 'GET',
            path: '/node_modules/{param*}',
            handler: {
                directory: {
                    path: '../node_modules',
                    redirectToSlash: true
                }
            },
            options: { auth: false }
        });
        server.route({
            method: 'GET',
            path: '/ace/{param*}',
            handler: {
                directory: {
                    path: '../node_modules/ace-builds/src-min-noconflict',
                    redirectToSlash: true
                }
            },
            options: { auth: false }
        });

        server.route({
            method: 'GET',
            path: '/assets/{param*}',
            handler: {
                directory: {
                    path: 'src/client/assets',
                    redirectToSlash: true
                }
            },
            options: { auth: false }
        });

        server.route({
            method: 'GET',
            path: '/app/{param*}',
            handler: {
                directory: {
                    path: 'src/client/app',
                    redirectToSlash: true
                }
            },
            options: { auth: false }
        });

        if (serverConfig.environment === 'production') {
            server.route({
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: 'dist',
                        redirectToSlash: true,
                        index: true
                    }
                },
                options: { auth: false }
            });
        } else {
            server.route({
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: 'client',
                        redirectToSlash: true,
                        index: true
                    }
                },
                options: { auth: false }
            });
        }

        /**
         * Handler for 404 which also serves the Angular webapp
         * (This enables routing within the real path section)
         */
        server.ext('onPreResponse', (request, h: ResponseToolkit) => {
            let response = request.response as any;
            if ((request.response as any).isBoom && (response.output.statusCode === 404)) {
                let indexFile: string;
                if (serverConfig.environment === 'production') {
                    indexFile = path.join(__dirname, '../../dist/index.html');
                } else {
                    indexFile = path.join(__dirname, '../../client/index.html');
                }
                return h.file(indexFile);
            }

            return h.continue;
        });

        /**
         * Request logging
         */
        server.ext('onPreResponse', (request: Request, h: ResponseToolkit) => {
            winston.debug(
                `[${chalk.red(request.info.id)}] ${chalk.cyan(request.info.remoteAddress)}: ` +
                `<${chalk.yellow(h.response().statusCode as any)}> ${chalk.green(request.method)} ${request.path}`);
            return h.continue;
        });

        /**
         * Print routes for debugging
         */
        winston.info(chalk.underline.cyan('Routes'));
        for(const route of server.table()) {
            winston.info(`- ${route.method} ${route.path}`);
        }

        /**
         * Run server
         */
        try {
            await server.start();
        } catch (err) {
            winston.error(err);
            return;
        }
        winston.info('Server running at:', server.info.uri);
        winston.info(`Started in ${chalk.cyan(serverConfig.environment)} mode`);
    } catch (ex) {
        console.error(ex);
    }
})();
