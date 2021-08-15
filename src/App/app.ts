import * as express from "express"
import { Server, Path, GET, PathParam } from "typescript-rest"

@Path("/chat")
class ChatService {
    @Path(":channel")
    @GET
    getChatHistory(@PathParam("channel") channel: string) {
        
    }
}

let app: express.Application = express();
Server.buildServices(app);

app.listen(8080, () => {
    console.log("Listening on 8080.");
});