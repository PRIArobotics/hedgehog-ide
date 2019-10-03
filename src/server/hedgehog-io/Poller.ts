export default class Poller {
    private timer: any | null;

    public constructor(private callback: () => Promise<void>, private interval: number) {
        this.schedule();
    }

    public cancel() {
        clearTimeout(this.timer);
        this.timer = null;
    }

    private schedule() {
        this.timer = setTimeout(async () => {
            await this.callback();
            if (this.timer !== null)
                this.schedule();
        }, this.interval);
    }
}
