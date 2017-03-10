import WebSocket = require('ws');
import WebSocketJSONStream = require('websocket-json-stream');
import ShareDB = require('sharedb');

export default class ShareDbService {
    private backend;

    public constructor (server) {
        this.backend = new ShareDB();

        let wss = new WebSocket.Server({server});
        wss.on('connection', ws => {
            let stream = new WebSocketJSONStream(ws);
            this.backend.listen(stream);
        });
    }
}
