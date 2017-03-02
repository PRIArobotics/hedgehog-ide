interface IServerConfig {
    environment: string;
    programStorageDirectory: string;
    hedgehogConnection: string;
    process: IProcessConfig;
    connection: IConnectionConfig;
    logging: ILoggingConfig;
}

interface IProcessConfig {
    temporaryStorageDirectory: string;
    pythonPath: string;
}

interface IConnectionConfig {
    port: number;
    host: string;
}

interface ILoggingConfig {
    level: string;
}

declare let serverConfig: IServerConfig;
export = serverConfig;
