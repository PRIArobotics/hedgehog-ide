interface IServerConfig {
    environment: string;
    programStorageDirectory: string;
    hedgehogConnection: string;
    process: IProcessConfig;
    connection: IConnectionConfig;
    logging: ILoggingConfig;
    auth: IAuthConfig;
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

interface IAuthConfig {
    jwtSecret: string;
}

declare let serverConfig: IServerConfig;
export = serverConfig;
