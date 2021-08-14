import { Log } from "./Log";
import { MongoClient } from "./MongoClient";
import { TwitchClient } from "./TwitchClient";

class TwitchLogger {

    private client: TwitchClient;
    private mongodb: MongoClient;
    private log: Log;

    constructor() {
        this.log = new Log();
        this.client = new TwitchClient(this.log, this.getClientOptions());
        this.mongodb = new MongoClient(this.log, null); //TODO remove null config
    }

    async start(): Promise<void> {
        this.log.info("Starting TwitchLogger");
        
        await this.client.start();
        await this.mongodb.start();
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
//let logger: TwitchLogger = new TwitchLogger();
//logger.start();

const clientOptions = {
    options: { debug: true },
    connection: {
        secure: true,
        reconnect: true
    },
    channels: [ "sodapoppin" ]
};

let log: Log = new Log();
let client: TwitchClient = new TwitchClient(log, clientOptions);
client.start();
