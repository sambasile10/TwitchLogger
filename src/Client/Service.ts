import { mongo } from "mongoose";
import { Log } from "./Log";
import { MongoClient, MongoConfig, QueryParams, Message } from "./MongoClient";
import { TwitchClient } from "./TwitchClient";

export class TwitchLogger {

    private _client: TwitchClient;
    private mongodb: MongoClient;
    private log: Log;

    private clientOptions: any;

    constructor() {
        this.log = new Log();
        this.clientOptions = this.getClientOptions();
        this._client = new TwitchClient(this.log, this.clientOptions);
        this.mongodb = new MongoClient(this.log, {
            channels: this.clientOptions.channels,
            dbURL: "mongodb://mongo:27017/db"
        } as MongoConfig); 
    }

    public async start(): Promise<void> {
        this.log.info("Starting TwitchLogger");
        
        await this.mongodb.start();
        await this._client.start();
    };

    mongo(): MongoClient {
        return this.mongodb;
    }

    client(): TwitchClient {
        return this._client;
    }

    //TODO read client options from file
    private getClientOptions(): any {
        return ({
            options: { debug: false },
            connection: {
                secure: true,
                reconnect: true
            },
            channels: [ "sodapoppin", "Silvervale" ]
        });
    }

}
