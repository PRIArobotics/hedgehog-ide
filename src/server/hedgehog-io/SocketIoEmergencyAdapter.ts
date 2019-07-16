import { HedgehogClient, Message, emergency } from 'hedgehog-client';

export default class SocketIoSensorAdapter {
    private ns: SocketIO.Namespace;
    private requests: Message[] = [];

    public constructor (private hedgehog: HedgehogClient, io: SocketIO.Server) {
        this.ns = io.of('/emergency');
        this.requests.push(new emergency.Request());
        setInterval(async () => this.sendEmergencyUpdate(), 200);
    }

    private async sendEmergencyUpdate () {
        let emergencyData: Array<{value: number, type: string}> = [];
        for (let reply of await this.hedgehog.sendMultipart(...this.requests)) {
            let type: string;
            let value: number;
            if (reply instanceof emergency.Reply) {
                type = 'emergency';
                value = reply.value? 1 : 0;
            } else {
                continue;
            }
            emergencyData.push({ type, value });
        }
        this.ns.emit('data', emergencyData);
    }
}
