# Twitch Logger

Twitch Logger is a lightweight chat log powered by Typescript and Mongo that serves data via REST calls


## Endpoints
GET /channel/x?username=y&regex=z
Get a user's (y) chat history in a channel (x) that can be filtered with a optional regex parameter (z).

GET /service/status
Return's the loggers current status

GET /service/config
Return's the loggers active configuration
