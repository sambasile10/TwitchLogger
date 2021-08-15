import express from "express"
import { Server, Path, GET, PathParam, QueryParam } from "typescript-rest"
import { QueryParams, TwitchLogger, _TwitchLogger } from "../Client";
import * as dotenv from "dotenv"

@Path("/chat")
class ChatService {
    @Path("/:channel")
    @GET
    getChatHistory(@PathParam("channel") channel: string, 
        @QueryParam("username") username: string, 
            @QueryParam("regex") regex?: string) {
        return this.queryChatHistory(channel, username, regex);
    }

    private queryChatHistory(channel: string, username: string, regex?: string): string {
        let params: QueryParams = {
            channel: channel,
            username: username,
        };

        if(regex) {
            params["regex"] = regex;
        }

        return JSON.stringify(_TwitchLogger.query(params));
    }
}

dotenv.config();

const port = Number(process.env.PORT || 8080);
let app: express.Application = express();
Server.buildServices(app);

app.listen(port, () => {
    console.log("Listening on " + port + ".");
});