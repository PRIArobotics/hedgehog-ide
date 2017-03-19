interface IServerConfig {
    environment: string;
    programStorageDirectory: string;
    hedgehogConnection: string;
    process: IProcessConfig;
    connection: IConnectionConfig;
    logging: ILoggingConfig;
    shareDb: IShareDbConfig;
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

interface IShareDbConfig {
    port: number;
}

declare let serverConfig: IServerConfig;
export = serverConfig;
