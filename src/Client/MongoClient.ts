import mongoose from "mongoose"
import { Document, Model, model, Types, Schema, Query } from "mongoose";
import { Log } from "./Log";

export declare interface Message {
    username: string,
    timestamp: Date,
    message: string
}

export class MongoClient {

    protected schema = new Schema<Message>({
        username: { type: String, required: true },
        timestamp: { type: Date, required: true },
        message: { type: String, required: true }
    });
    
    protected MessageModel = model<Message>('Message', this.schema);

    private CONNECTION_URL: string;
    private log: Log;
    private dbCount: number = 0;

    constructor(log: Log, config: any) {
        this.log = log;
        this.CONNECTION_URL = "mongodb://mongo:27017/db";
    }

    public async writeMessage(message: Message): Promise<void> {
        const messageDocument = new this.MessageModel({
            username: message.username,
            timestamp: message.timestamp,
            message: message.message
        });

        await messageDocument.save();
        this.dbCount++;
        this.log.trace("Wrote message document!");
    }

    public async start(): Promise<void> {
        this.log.info("Using MongoDB at: " + this.CONNECTION_URL);
        await this.connect();

        this.enableListeners();
    }

    public getAll(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const query = this.MessageModel.find({})
            .limit(20).exec((err, res) => {
                if(err) {
                    this.log.error("Error occured in the find all query. ");
                    this.log.error(JSON.stringify(err));
                    reject(err);
                }

                resolve(res);
            });
        });
    }

    public getByUsername(queryUser: string): Promise<Message[]> {
        return new Promise<Message[]>((resolve, reject) => {
            const query = this.MessageModel.find({ username: queryUser }).exec((err, res) => {
                if(err) {
                    this.log.error("Error occured while querying by username: " + queryUser);
                    this.log.error(JSON.stringify(err));
                    reject(err);
                }

                this.log.debug("Found " + res.length + " messages for user: \'" + queryUser + "\'");
                resolve(res);
            }); 
        });
    }

    private connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.log.debug("Establishing connection to database");
            mongoose.connect(this.CONNECTION_URL, {
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
}

