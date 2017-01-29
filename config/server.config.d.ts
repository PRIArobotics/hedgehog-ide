interface IServerConfig {
    environment: string;
    programStorageDirectory: string;
    process: IProcessConfig;
    connection: IConnectionConfig;
}

interface IProcessConfig {
    temporaryStorageDirectory: string;
    pythonPath: string;
}

interface IConnectionConfig {
    port: number;
    host: string;
}

declare let serverConfig: IServerConfig;
export = serverConfig;
