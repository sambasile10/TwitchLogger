import { Log } from "./Log";
import { MongoClient, MongoConfig } from "./MongoClient";
import { TwitchClient } from "./TwitchClient";

export class TwitchLogger {

    private client: TwitchClient;
    public static mongodb: MongoClient;
    private log: Log;

    constructor() {
        this.log = new Log();
        this.client = new TwitchClient(this.log, this.getClientOptions());
        TwitchLogger.mongodb = new MongoClient(this.log, {
            channels: [ "sodapoppin" ],
            dbURL: "mongodb://mongo:27017/db"
        } as MongoConfig); //TODO remove null config
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
            channels: [ "sodapoppin" ]
        });
    }

}

//code execution starts here
let logger: TwitchLogger = new TwitchLogger();
logger.start();

