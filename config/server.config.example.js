exports = module.exports = {
    // 'production' will serve the webpack client package
    // 'debug' uses SystemJS
    environment: 'production',

    // Path where the programs will be storage
    programStorageDirectory: '/home/pi/hedgehog-programs',

    // ZMQ connection string for Hedgehog server
    hedgehogConnection: 'tcp://127.0.0.1:10789',

    // Process execution configuration
    process: {
        // Directory for temporary process stream capturing files
        temporaryStorageDirectory: '/tmp',

        // Path to python interpreter
        pythonPath: '/home/pi/HedgehogBundle/server/env/bin/python',
    },

    // Server connection definition for the backend
    connection: {
        port: 80,
        host: '0.0.0.0'
    },

    // Logging configuration
    logging: {
        level: 'debug'
    }
};
