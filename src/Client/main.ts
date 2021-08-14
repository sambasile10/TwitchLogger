import { Log } from "./Log";
import { MongoClient, MongoConfig } from "./MongoClient";
import { TwitchClient } from "./TwitchClient";

export class TwitchLogger {

    private client: TwitchClient;
    public static mongodb: MongoClient;
    private log: Log;

    private clientOptions: any;

    constructor() {
        this.log = new Log();
        this.clientOptions = this.getClientOptions();
        this.client = new TwitchClient(this.log, this.clientOptions);
        TwitchLogger.mongodb = new MongoClient(this.log, {
            channels: this.clientOptions.channels,
            dbURL: "mongodb://mongo:27017/db"
        } as MongoConfig); 
    }

    async start(): Promise<void> {
        this.log.info("Starting TwitchLogger");
        
        await TwitchLogger.mongodb.start();
        await this.client.start();
    };

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
let logger: TwitchLogger = new TwitchLogger();
logger.start();

