import { HedgehogClient, Message, emergency } from 'hedgehog-client';

export default class SocketIoEmergencyAdapter {
    private ns: SocketIO.Namespace;

    public constructor (private hedgehog: HedgehogClient, io: SocketIO.Server) {
        this.ns = io.of('/emergency');
        setInterval(() => this.sendEmergencyUpdate(), 200);
    }

    private async sendEmergencyUpdate () {
        let active = await this.hedgehog.getEmergencyStop();
        this.ns.emit('data', {active});
    }
}
