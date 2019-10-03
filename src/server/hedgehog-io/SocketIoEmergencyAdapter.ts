import { HedgehogClient, Message, emergency } from 'hedgehog-client';
import Poller from './Poller';

export default class SocketIoEmergencyAdapter {
    private ns: SocketIO.Namespace;
    private connectionCount: number = 0;
    private poller: Poller | null = null;

    public constructor (private hedgehog: HedgehogClient, io: SocketIO.Server) {
        this.ns = io.of('/emergency');

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
        this.poller = new Poller(() => this.sendEmergencyUpdate(), 200);
    }

    private stopUpdates() {
        this.poller.cancel();
        this.poller = null;
    }

    private async sendEmergencyUpdate () {
        let active = await this.hedgehog.getEmergencyStop();
        this.ns.emit('data', {active});
    }
}
