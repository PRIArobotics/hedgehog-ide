exports = module.exports = {
    // environment: 'debug',
    environment: 'production',

    // Path where the programs will be storage
    programStorageDirectory: './hedgehog-programs',

    // ZMQ connection string for Hedgehog server
    hedgehogConnection: 'tcp://127.0.0.1:10789',

    // Process execution configuration
    process: {
        // Directory for temporary process stream capturing files
        temporaryStorageDirectory: '/tmp',

        // Path to python interpreter
        pythonPath: 'python',
    },

    // Server connection definition for the backend
    connection: {
        port: 8000,
        host: '0.0.0.0'
    },

    // Logging configuration
    logging: {
        level: 'debug'
    },

    // Authentication configuration
    auth: {
        // Require authentication
        enabled: true,

        // Secret key used for signing JWT tokens
        // Generate it e.g. via node: 'node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"'
        jwtSecret: 'Supercalifragilisticexpialidocious'
    }
};
