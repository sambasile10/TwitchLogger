import * as mongoose from "mongoose"

export class MongoClient {

    private CONNECTION_URL: string;

    constructor(config: any) {
        this.CONNECTION_URL = "placeholder";
    }

    protected async start(): Promise<void> {
        await this.connect();
    }

    private connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            mongoose.connect(this.CONNECTION_URL, {
                useNewUrlParser: true, //TODO config mongo
                useUnifiedTopology: true
            }).then((res) => {
                resolve();
            }).catch((err) => {
                reject(err);
            })
        });
    }
}

