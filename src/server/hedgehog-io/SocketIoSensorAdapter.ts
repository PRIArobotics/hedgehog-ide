import { HedgehogClient, Message, analog, digital } from 'hedgehog-client';
import Poller from './Poller';

export default class SocketIoSensorAdapter {
    private ns: SocketIO.Namespace;
    private requests: Message[] = [];
    private connectionCount: number = 0;
    private poller: Poller | null = null;

    public constructor(private hedgehog: HedgehogClient, io: SocketIO.Server) {
        this.ns = io.of('/sensors');
        for (let port = 0; port < 16; port++) {
            this.requests.push(new analog.Request(port), new digital.Request(port));
        }

        this.ns.on('connection', socket => {
            if (this.connectionCount === 0) {
                this.startUpdates();
            }
            this.connectionCount += 1;

            socket.on('disconnect', () => {
                this.connectionCount -= 1;
                if (this.connectionCount === 0) {
                    this.stopUpdates();
                }
            });
        });

    }

    private startUpdates() {
        this.poller = new Poller(() => this.sendSensorUpdate(), 200);
    }

    private stopUpdates() {
        this.poller.cancel();
        this.poller = null;
    }

    private async sendSensorUpdate() {
        let sensorData: Array<{id: number, value: number, type: string}> = [];
        for (let reply of await this.hedgehog.sendMultipart(...this.requests)) {
            let id: number;
            let type: string;
            let value: number;
            if (reply instanceof analog.Reply) {
                id = reply.port;
                type = 'analog';
                value = reply.value;
            } else if (reply instanceof digital.Reply) {
                id = reply.port;
                type = 'digital';
                value = reply.value? 1 : 0;
            } else {
                continue;
            }
            sensorData.push({ id, type, value });
        }
        this.ns.emit('data', sensorData);
    }
}
