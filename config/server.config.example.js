exports = module.exports = {
    environment: 'production',
    programStorageDirectory: 'tmp',
    process: {
        temporaryStorageDirectory: 'tmp_proc',
        pythonPath: 'python3',
    },
    connection: {
        port: 8000,
        host: 'localhost'
    },
};
