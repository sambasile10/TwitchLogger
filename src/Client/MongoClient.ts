import mongoose from "mongoose"
import { Document, Model, model, Types, Schema, Query } from "mongoose";
import { Log } from "./Log";

export declare interface Message {
    username: string,
    timestamp: Date,
    message: string
}

export declare interface MongoConfig {
    channels: string[]
    dbURL: string
}

export declare interface QueryParams {
    channel: string, //required channel
    username?: string, //optional username
    regex?: string, //optional regex filter
}

export class MongoClient {

    protected MessageSchema = new Schema<Message>({
        username: { type: String, required: true },
        timestamp: { type: Date, required: true },
        message: { type: String, required: true }
    });
    
    protected MessageModel = mongoose.model<Message>('message', this.MessageSchema, 'sodapoppin');

    private config: MongoConfig;
    private log: Log;
    private dbCount: number = 0;

    private messageLimit: number = 100;

    constructor(log: Log, config: MongoConfig) {
        this.log = log;
        this.config = config;
    }

    public async writeMessage(channel: string, message: Message): Promise<void> {
        await mongoose.model(channel.toLowerCase()).create({
            username: message.username,
            timestamp: message.timestamp,
            message: message.message
        });

        this.dbCount++;
        this.log.trace("Wrote message document!");

        if(this.dbCount % 10 == 0) {
            let params: QueryParams = {
                channel: "#sodapoppin",
                username: "afnos_",
                regex: "nyan"
            };

            let result: Message[] = await this.query(params);
            result.forEach((element) => {
                this.log.debug("[" + element.timestamp + "] <" + element.username + "> " + element.message);
            })
        }
    }

    public async start(): Promise<void> {
        this.log.info("Using MongoDB at: " + this.config.dbURL);
        await this.connect();
        await this.buildModels();

        this.enableListeners();
    }

    public query(params: QueryParams): Promise<Message[]> {
        return new Promise<Message[]>((resolve, reject) => {
            let query = mongoose.model(params.channel.toLowerCase()).find().limit(this.messageLimit);
            if(params.username) {
                query.where("username", params.username);
            }

            if(params.regex) {
                query.where("message", { "$regex": params.regex });
            }

            let result: Message[] = [];
            query.exec().then((res) => {
                result = JSON.parse(JSON.stringify(res));
                this.log.debug("Found " + result.length + " results matching query");
                resolve(result);
            }).catch((err) => {
                this.log.error("Error occured for query. " + err);
                resolve(result);
            });
        });
    }

    public getAll(channel: string): Promise<Message[]> {
        return new Promise<Message[]>((resolve, reject) => {
            const query = mongoose.model(channel.toLowerCase()).find({})
            .limit(20).exec((err, res) => {
                if(err) {
                    this.log.error("Error occured in the find all query. ");
                    this.log.error(JSON.stringify(err));
                    reject(err);
                }

                let result: Message[] = JSON.parse(JSON.stringify(res));
                resolve(result);
            });
        });
    }

    public getByUsername(channel: string, queryUser: string): Promise<Message[]> {
        return new Promise<Message[]>((resolve, reject) => {
            const query = mongoose.model(channel.toLowerCase()).find({ username: queryUser }, "username timestamp message -_id").exec((err, res) => {
                if(err) {
                    this.log.error("Error occured while querying by username: " + queryUser);
                    this.log.error(JSON.stringify(err));
                    reject(err);
                }

                this.log.debug("Found " + res.length + " messages for user: \'" + queryUser + "\'");

                let result: Message[] = JSON.parse(JSON.stringify(res));
                resolve(result);
            }); 
        });
    }

    private connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.log.debug("Establishing connection to database");
            mongoose.connect(this.config.dbURL, {
                useNewUrlParser: true, //TODO config mongo
                useUnifiedTopology: true
            }).then((res) => {
                this.log.debug("MongoDB connection successful.");
                resolve();
            }).catch((err) => {
                this.log.fatal("Failed to establish connection with MongoDB");
                reject(err);
            });
        });
    }

    private enableListeners(): void {
        mongoose.connection.on("connected", () => {
            this.log.trace("Mongoose connected event fired.");
        });

        mongoose.connection.on("reconnected", () => {
            this.log.trace("Mongoose reconnected event fired.");
        });

        mongoose.connection.on("error", (err) => {
            this.log.trace("Mongoose error event fired.");
        });

        mongoose.connection.on("disconnected", () => {
            this.log.trace("Mongoose disconnected event fired.");
        });

        this.log.debug("Enabled mongoose listeners.");
    }

    private buildModels(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.config.channels.forEach((channel) => {
                const chnName = channel.toLowerCase();
                this.log.debug("Building mode for: \'" + chnName + "\'.");
                let model = mongoose.model(chnName, this.MessageSchema);
            });

            resolve();
        });
    }
}

