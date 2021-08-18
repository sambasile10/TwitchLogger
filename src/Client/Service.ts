import { config } from "dotenv";
import { mongo } from "mongoose";
import { Log } from "./Log";
import { MongoClient, QueryParams, Message } from "./MongoClient";
import { TwitchClient } from "./TwitchClient";

import twitchconfig from '../../twitchconfig.json'

export declare interface Configuration {
    debug: boolean,
    channels: string[],
    dbURL: string
    maxQueryLimit: number
};

export class TwitchLogger {

    private _client: TwitchClient;
    private mongodb: MongoClient;
    private log: Log;

    private clientOptions: any;

    constructor() {
        this.log = new Log();
        this.clientOptions = this.getClientOptions(twitchconfig as Configuration);
        this._client = new TwitchClient(this.log, this.clientOptions);
        this.mongodb = new MongoClient(this.log, twitchconfig as Configuration); 
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

    //Return server status blob
    status(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            resolve({
                client: this.client().getStatus(),
                db: await this.mongo().getStatus()
            });
        });
    }

    config(): Configuration {
        return twitchconfig as Configuration;
    }

    //TODO read client options from file
    private getClientOptions(config: Configuration): any {
        let options: any = {
            options: { debug: Boolean(config.debug || false) },
            connection: {
                secure: true,
                reconnect: true
            }
        };
        
        if(config.channels) {
            options.channels = config.channels;
            this.log.info("Monitoring channels: " + JSON.stringify(options.channels));
        } else {
            options.channels = [ "sodapoppin" ]; //default to sodapoppin
            this.log.warn("Configuration file is missing a channels of type string[]. Using default 'sodapoppin'.");
        }

        return options;
    }

    addChannel(channel: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            channel = channel.toLowerCase();
            if(twitchconfig.channels.includes(channel)) {
                this.log.warn("Can't add channel \'" + channel + "\', it is arlready in the configuration.");
                reject("Can't add channel \'" + channel + "\', it is arlready in the configuration.");
            } else {
                Promise.all([
                    this.client().addChannel(channel), this.mongo().addChannel(channel)
                ]).then(() => {
                    twitchconfig.channels.push(channel);
                    this.log.info("Added channel: " + channel);
                    resolve();
                }).catch((err) => {
                    this.log.warn("Failed to add channel: " + channel);
                    reject(err);
                })
            }
        });
    }

    removeChannel(channel: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all([
                this.client().removeChannel(channel), this.mongo().removeChannel(channel)
            ]).then(() => {
                delete twitchconfig.channels[channel];
                this.log.info("Dropped channel: " + channel);
                resolve();
            }).catch((err) => {
                this.log.warn("Failed to drop channel: " + channel);
                reject(err);
            })
        });
    }

}
