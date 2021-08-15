import * as tmi from 'tmi.js'
import { _TwitchLogger } from '../App/app';
import { Log } from './Log';
import { TwitchLogger } from './Service';
import { Message } from './MongoClient';

export enum TwitchClientStatusType {
    Connected = "Connected", 
    Disconnected = "Disconnected", 
    Reconnected = "Reconnected"
};

export declare interface TwitchClientStatusData {
    status: TwitchClientStatusType,
    statusDetail?: string,
};

export class TwitchClient {

    private log: Log;

    private client: tmi.Client;
    private clientOptions: tmi.Options;

    private status: TwitchClientStatusData;

    constructor(log: Log, clientOptions: any) {
        this.log = log;
        this.clientOptions = clientOptions;

        this.log.debug("Using TMI Client options: " + JSON.stringify(clientOptions));
        this.client = new tmi.Client(clientOptions as tmi.Options);

        this.status = {
            status: TwitchClientStatusType.Disconnected,
            statusDetail: "No connection, client is uninitialized"
        };
    }

    //Starts the twitch client
    async start(): Promise<void> {
        this.log.info("Starting TMI client...");
        this.listen();
        await this.connect();  
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

        //Listen for chat messages (doesn't include subs, /me, cheering, gifts, etc)
        this.client.on("chat", (channel, userstate, message, self) => {
            if(self) { return; }

            const messageObject = {
                username: userstate['display-name'] as string,
                timestamp: new Date(),
                message: message
            };

            _TwitchLogger.mongo().writeMessage(channel, messageObject as Message);
        });

        //Listen for IRC connections
        this.client.on("connected", (address, port) => {
            this.log.info("Connected to chat server @ " + address + ":" + port + ".");
            this.status["status"] = TwitchClientStatusType.Connected;
            this.status["statusDetail"] = String(address + ":" + port);
        });

        //Listen for IRC disconnects
        this.client.on("disconnected", (reason) => {
            this.log.error("Disconnected from chat server. Reason: " + reason);
            this.status["status"] = TwitchClientStatusType.Disconnected;
            this.status["statusDetail"] = reason;
        });

        //Listen for attempted reconnections
        this.client.on("reconnect", () => {
            this.log.warn("Reconnecting to chat server");
            this.status["status"] = TwitchClientStatusType.Reconnected;
            this.status["statusDetail"] = "Reconnecting";
        });
    }

    getStatus(): TwitchClientStatusData {
        return this.status;
    }
}