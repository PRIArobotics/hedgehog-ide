import WebSocket = require('ws');
import WebSocketJSONStream = require('websocket-json-stream');
import ShareDB = require('sharedb');

export default class ShareDbService {
    private backend;

    public constructor (server) {
        this.backend = new ShareDB();
        this.backend.connect();

        let connection = this.backend.connect();

        let doc = connection.get('hedgehog-ide', 'program');
        doc.create({
                    'Li90ZXN0LnB5': `import time
import sys

for i in range(100):
    print(i)
    sys.stdout.flush()
    
time.sleep(5)`,
                    'YXNkZmdoL2FnYXNkZmcucHk_': `from time import sleep
from hedgehog.client import connect

with connect(emergency=15) as hedgehog:
	print("Hello World")

`,
                    'YXNkZmdoL2RmYXNnZGY_': ``
        });

        let wss = new WebSocket.Server({server});
        wss.on('connection', ws => {
            let stream = new WebSocketJSONStream(ws);
            this.backend.listen(stream);
        });
    }
}
