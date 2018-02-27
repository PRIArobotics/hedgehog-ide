import ShareDB = require('sharedb');
import IProgramStorage from "../../common/versioncontrol/ProgramStorage";
import SocketIoJsonStream from "./SocketIoJsonStream";

export default class ShareDbService {
    private ns: SocketIO.Namespace;

    private backend;
    private connection;

    public constructor (private programStorage: IProgramStorage, io: SocketIO.Server) {
        this.backend = new ShareDB();
        this.backend.connect();

        this.connection = this.backend.connect();

        this.ns = io.of('/realtime-sync');
        this.ns.on('connection', (socket: SocketIO.Socket) => {
            let stream = new SocketIoJsonStream(socket);
            this.backend.listen(stream);
        });
    }
}
