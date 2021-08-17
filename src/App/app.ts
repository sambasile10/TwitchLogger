import express from "express"
import { Server, Path, GET, PathParam, QueryParam, Return, Errors, PUT, DELETE } from "typescript-rest"
import { QueryParams, TwitchLogger } from "../Client";
import * as dotenv from "dotenv"

@Path("/chat")
class ChatService {
    @Path("/:channel")
    @GET
    getChatHistory(@PathParam("channel") channel: string, 
        @QueryParam("username") username: string, 
            @QueryParam("regex") regex?: string) {
        
        return new Promise<any>((resolve, reject) => {
            this.queryChatHistory(channel, username, regex).then((res) => {
                resolve(res as string);
            }).catch((err) => {
                reject(new Errors.BadRequestError(err as string));
            });
        });
    }

    private async queryChatHistory(channel: string, username: string, regex?: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            console.log("Querying chat | channel: " + channel + ", username: " + username + ", regex: " + regex);
            let params: QueryParams = {
                channel: "#" + channel,
                username: username,
            };
    
            if(regex) {
                params["regex"] = regex;
            }
    
            _TwitchLogger.mongo().query(params).then((res) => {
                res.forEach((v, idx, arr) => {
                     delete v.username; 
                     if(idx == arr.length - 1) resolve(JSON.stringify(res));
                });
            }).catch((err) => {
                resolve(new Errors.BadRequestError(err as string));
            })
        });
    }

    //Add a channel to the database list
    @Path("/:channel")
    @PUT
    addChannel(@PathParam("channel") channel: string) {
        return new Promise<any>((resolve, reject) => {
            channel = "#" + channel;
            if(_TwitchLogger.config().channels.includes(channel)) {
                //Channel already exists in config
                reject(new Errors.BadRequestError("Channel \'" + channel + "\' already in configuration list."));
            }

            _TwitchLogger.addChannel(channel).then((res) => {
                resolve("200");
            }).catch((err) => {
                reject(new Errors.InternalServerError("Error occured while adding new channel: " + JSON.stringify(err)));
            });
        });
    }

    //Drop a channel collection and remove it from the config
    @Path("/:channel")
    @DELETE
    removeChannel(@PathParam("channel") channel: string) {
        return new Promise<any>((resolve, reject) => {
            channel = "#" + channel;
            if(!_TwitchLogger.config().channels.includes(channel)) {
                //Channel isn't in config list
                reject(new Errors.BadRequestError("Channel \'" + channel + "\' not in configuration"));
            }

            _TwitchLogger.removeChannel(channel).then(() => {
                resolve("200"); //why 200 
            }).catch((err) => {
                reject(new Errors.InternalServerError("Error occured while dropping collection: " + JSON.stringify(err)));
            });
        });
    } 

}

@Path("/service")
class StatusService {
    @Path("/status/")
    @GET
    async getServiceStatus() {
        return await this.getStatus();
    }

    private async getStatus(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            _TwitchLogger.status().then((res) => {
                resolve(JSON.stringify(res));
            }).catch((err) => {
                resolve(JSON.stringify(err));
            })
        });
    }

    @Path("/config/")
    @GET
    async getServiceConfig() {
        return await this.getConfig();
    }

    private async getConfig(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            resolve(JSON.stringify(_TwitchLogger.config()));
        });
    }
}

//Start dotenv
dotenv.config();

//Start the logging service
let _TwitchLogger: TwitchLogger = new TwitchLogger();
_TwitchLogger.start();
export { _TwitchLogger };

//Start typescript-rest and express
const port = Number(process.env.PORT || 8080);
let app: express.Application = express();
Server.buildServices(app);

app.listen(port, () => {
    console.log("Listening on " + port + ".");
});