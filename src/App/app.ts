import express from "express"
import { Server, Path, GET, PathParam, QueryParam } from "typescript-rest"
import { QueryParams, TwitchLogger } from "../Client";
import * as dotenv from "dotenv"

@Path("/chat")
class ChatService {
    @Path("/:channel")
    @GET
    async getChatHistory(@PathParam("channel") channel: string, 
        @QueryParam("username") username: string, 
            @QueryParam("regex") regex?: string) {
        return await this.queryChatHistory(channel, username, regex);
    }

    private async queryChatHistory(channel: string, username: string, regex?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            console.log("Querying chat | channel: " + channel + ", username: " + username + ", regex: " + regex);
            let params: QueryParams = {
                channel: "#" + channel,
                username: username,
            };
    
            if(regex) {
                params["regex"] = regex;
            }
    
            _TwitchLogger.mongo().query(params).then((res) => {
                resolve(JSON.stringify(res));
            }).catch((err) => {
                resolve("error: " + JSON.stringify(err));
            })
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