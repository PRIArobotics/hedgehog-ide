exports = module.exports = {
    // 'production' will serve the webpack client package
    // 'debug' uses SystemJS
    environment: 'production',

    // Path where the programs will be storage
    programStorageDirectory: 'tmp',

    // ZMQ connection string for Hedgehog server
    hedgehogConnection: 'tcp://127.0.0.1:10789',

    // Process execution configuration
    process: {
        // Directory for temporary process stream capturing files
        temporaryStorageDirectory: 'tmp_proc',

        // Path to python interpreter
        pythonPath: 'python3',
    },

    // Server connection definition for the backend
    connection: {
        port: 8000,
        host: 'localhost'
    },

    // ShareDB configuration for realtime editor synchronisation support
    shareDb: {
        // Since socket.io uses websocket too, another port for
        port: 8001,
    },

    // Logging configuration
    logging: {
        level: 'debug'
    }
};
