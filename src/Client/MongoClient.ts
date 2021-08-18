import mongoose from "mongoose"
import { Document, Model, model, Types, Schema, Query } from "mongoose";
import { Log } from "./Log";
import { Configuration } from "./Service";

export declare interface Message {
    username?: string,
    timestamp: Date,
    message: string
}

export declare interface QueryParams {
    channel: string, //required channel
    username?: string, //optional username
    regex?: string, //optional regex filter
    userField?: boolean, //if false the username will not be included in the results
    limit?: number, //limit number of results
    skip?: number, //skip to given offset
}

export declare interface QueryResult {
    exec_time: number, //query execution time in milliseconds
    length: number, //number of messages in result
    result: Message[] //query result as an array of messages
}

export class MongoClient {

    protected MessageSchema = new Schema<Message>({
        username: { type: String, required: true },
        timestamp: { type: Date, required: true },
        message: { type: String, required: true }
    });

    private config: Configuration;
    private log: Log;
    private dbCount: number = 0;

    constructor(log: Log, config: Configuration) {
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
    }

    public async start(): Promise<void> {
        this.log.info("Using MongoDB at: " + this.config.dbURL);
        await this.connect();
        await this.buildModels();

        this.enableListeners();
    }

    public query(params: QueryParams): Promise<QueryResult> {
        return new Promise<QueryResult>((resolve, reject) => {
            let start_time = performance.now();
            let query = mongoose.model(params.channel.toLowerCase()).find();
            let selection: string = "username timestamp message -_id";
            if(params.userField == false) { 
                selection = "timestamp message -_id";
            }

            query.select(selection);
            if(params.username) {
                query.where("username", params.username);
            }

            if(params.regex) {
                query.where("message", { "$regex": params.regex });
            }

            if(params.limit) {
                query.limit(this.config.maxQueryLimit > params.limit ? params.limit : this.config.maxQueryLimit);
            }

            if(params.skip) {
                query.skip(params.skip); //TODO add length checks?
            }

            let message_array: Message[] = [];
            let exec_time: number;
            query.exec().then((res) => {
                message_array = JSON.parse(JSON.stringify(res));
                exec_time = (performance.now() - start_time);
                this.log.debug("Found " + message_array.length + " results matching query in " + exec_time + "ms.");
                resolve({   
                    exec_time: exec_time,
                    length: message_array.length,
                    result: message_array
                } as QueryResult);
            }).catch((err) => {
                this.log.warn("Error occured for query. Is the channel monitored? Does the user not exist? Query failed in " + exec_time + "ms.");
                exec_time = (performance.now() - start_time);
                resolve({   
                    exec_time: exec_time,
                    length: message_array.length,
                    result: message_array
                } as QueryResult);
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
                this.log.debug("Building model for: \'" + chnName + "\'.");
                let model = mongoose.model(chnName, this.MessageSchema);
            });

            resolve();
        });
    }

    getStatus(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let blob = {
                collections: this.config.channels,
                sessionCount: this.dbCount,
                data: [] as any[]
            };

            let requests: number = this.config.channels.length;
            this.config.channels.forEach(async (channel, index, array) => {
                let stats = await mongoose.model(channel.toLowerCase()).collection.stats();
                blob.data.push({
                    channel: channel,
                    count: stats.count,
                    size: stats.storageSize,
                    average_document_size: Number(stats.storageSize / stats.count)
                });

                requests--;
                if(requests == 0) { resolve(blob); }
            });
        });
    }

    addChannel(channel: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const chnName = channel.toLowerCase();
            this.log.debug("Building model for: \'" + chnName + "\'.");
            let model = mongoose.model(chnName, this.MessageSchema);
            resolve();
        });
    }

    //TODO just drop the collection
    removeChannel(channel: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const chnName = channel.toLowerCase();
            mongoose.model(chnName).deleteMany({}).then((res) => {
                this.log.warn("Deleted all entries of model: " + chnName);
                resolve();
            }).catch((err) => {
                this.log.error("Failed to delete entries of model: " + chnName);
                reject(err);
            })
        });
    }
}

