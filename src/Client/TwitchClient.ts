import * as tmi from 'tmi.js'
import { Log } from './Log';

export class TwitchClient {

    private log: Log;

    private client: tmi.Client;
    private clientOptions: tmi.Options;

    constructor(log: Log, clientOptions: any) {
        this.log = log;
        this.clientOptions = clientOptions;

        this.log.debug("Using TMI Client options: " + clientOptions);
        this.client = new tmi.Client(clientOptions as tmi.Options);
    }

    async start(): Promise<void> {
        this.log.info("Starting TMI client...");
        await this.connect();

        this.listen();
    }

    private connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.connect().then((res) => {
                this.log.info("TMI client successfully connected.");
                resolve();
            }).catch((err) => {
                this.log.fatal("TMI client failed to connect." + err);
                reject(err);
            });
        });
    }

    private listen(): void {
        this.log.debug("Starting TMI client listeners.");
        this.client.on("chat", (channel, userstate, message, self) => {
            if(self) { return; }

            this.log.info("[" + userstate['display-name'] + "] " + message);
        });
    }
}