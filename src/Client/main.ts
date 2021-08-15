import { mongo } from "mongoose";
import { Log } from "./Log";
import { MongoClient, MongoConfig, QueryParams, Message } from "./MongoClient";
import { TwitchClient } from "./TwitchClient";

export class TwitchLogger {

    private client: TwitchClient;
    private mongodb: MongoClient;
    private log: Log;

    private clientOptions: any;

    constructor() {
        this.log = new Log();
        this.clientOptions = this.getClientOptions();
        this.client = new TwitchClient(this.log, this.clientOptions);
        this.mongodb = new MongoClient(this.log, {
            channels: this.clientOptions.channels,
            dbURL: "mongodb://mongo:27017/db"
        } as MongoConfig); 
    }

    public async start(): Promise<void> {
        this.log.info("Starting TwitchLogger");
        
        await this.mongodb.start();
        await this.client.start();
    };

    public async query(params: QueryParams): Promise<Message[]> {
        return await this.mongodb.query(params);
    }

    //TODO read client options from file
    private getClientOptions(): any {
        return ({
            options: { debug: true },
            connection: {
                secure: true,
                reconnect: true
            },
            channels: [ "sodapoppin", "Silvervale" ]
        });
    }

}

//code execution starts here
let _TwitchLogger: TwitchLogger = new TwitchLogger();
_TwitchLogger.start();

export { _TwitchLogger };

