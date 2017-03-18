import WebSocket = require('ws');
import WebSocketJSONStream = require('websocket-json-stream');
import ShareDB = require('sharedb');
import IProgramStorage from "../../common/versioncontrol/ProgramStorage";

export default class ShareDbService {
    private backend;
    private connection;

    public constructor (server, private programStorage: IProgramStorage) {
        this.backend = new ShareDB();
        this.backend.connect();

        this.connection = this.backend.connect();
        let wss = new WebSocket.Server({server});
        wss.on('connection', ws => {
            let stream = new WebSocketJSONStream(ws);
            this.backend.listen(stream);
        });
    }

    public async init () {
        for (const name of await this.programStorage.getProgramNames())
            this.initProgramDoc(name);
    }

    public initProgramDoc (name: string) {
        this.connection.get('hedgehog-ide', name).create({ });
    }
}
