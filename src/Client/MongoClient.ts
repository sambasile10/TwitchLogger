import * as mongoose from "mongoose"
import { Document, Model, model, Types, Schema, Query } from "mongoose";
import { Log } from "./Log";

export interface Message {
    username: string,
    timestamp: Date,
    message: string
}

export class MongoClient {

    private CONNECTION_URL: string;

    private log: Log;

    constructor(log: Log, config: any) {
        this.log = log;
        this.CONNECTION_URL = "placeholder";
    }

    async start(): Promise<void> {
        this.log.info("Using MongoDB at: " + this.CONNECTION_URL);
        await this.connect();

        this.enableListeners();
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
        this.log.debug("Enabling mongoose listeners...");

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
    }
}

