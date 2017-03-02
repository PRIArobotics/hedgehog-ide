exports = module.exports = {
    environment: 'production',
    programStorageDirectory: 'tmp',
    hedgehogConnection: 'tcp://127.0.0.1:10789',
    process: {
        temporaryStorageDirectory: 'tmp_proc',
        pythonPath: 'python3',
    },
    connection: {
        port: 8000,
        host: 'localhost'
    },
    logging: {
        level: 'debug'
    }
};
