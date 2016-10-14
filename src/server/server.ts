/**
 * Created by markus on 14/10/16.
 */
const Hapi = require('hapi');
const Path = require('path');

// Create a server with a host and port
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '../client')
            }
        }
    }
});
server.connection({
    host: 'localhost',
    port: 8000
});

server.register(require('inert'), () => {});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true
        }
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});