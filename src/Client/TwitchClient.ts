import * as tmi from 'tmi.js'
import { _TwitchLogger } from '../App/app';
import { Log } from './Log';
import { TwitchLogger } from './main';
import { Message } from './MongoClient';

export class TwitchClient {

    private log: Log;

    private client: tmi.Client;
    private clientOptions: tmi.Options;

    constructor(log: Log, clientOptions: any) {
        this.log = log;
        this.clientOptions = clientOptions;

        this.log.debug("Using TMI Client options: " + JSON.stringify(clientOptions));
        this.client = new tmi.Client(clientOptions as tmi.Options);
    }

    //Starts the twitch client
    async start(): Promise<void> {
        this.log.info("Starting TMI client...");
        await this.connect();

        this.listen();
    }

    //Connect to the Twitch IRC service
    private connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.connect().then((res) => {
                this.log.info("TMI client successfully connected.");
                resolve();
            }).catch((err) => {
                this.log.fatal("TMI client failed to connect. " + err);
                reject(err);
            });
        });
    }

    //Starts TMI listeners
    private listen(): void {
        this.log.debug("Starting TMI client listeners.");
        this.client.on("chat", (channel, userstate, message, self) => {
            if(self) { return; }

            const messageObject = {
                username: userstate['display-name'] as string,
                timestamp: new Date(),
                message: message
            };

            _TwitchLogger.mongo().writeMessage(channel, messageObject as Message);
        });
    }
}