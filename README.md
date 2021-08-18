# Twitch Logger

Twitch Logger is a lightweight chat log powered by Typescript and Mongo that serves data via REST calls

## Deployment

Either use `./start.sh` OR

1. Export the environment variable `MOUNT_DB_PATH` to a location on the host filesystem
2. Run `docker-compose up --build`

The server's port can be changed by modifying the value in the `.env` file.

Other settings can be modified in `twitchconfig.json`

## Query user's chat history in a channel

### Request

`GET /chat/:channel`

### Parameters

| Parameter | Description | Required |
| ----- | ----- | ----- |
| username | Username to select messages from | Yes |
| regex | Filter query by a regular expression | No |
| limit | Limit number of messages in response | No |
| skip | Skip a number of messages in the collection | No |

### Example Query with required fields

`GET /chat/nyanners?username=myusername`

### Response

    {
      "exec_time": 2.812399998307228,
      "length": 2,
      "result": [
        {
          "timestamp": "2021-08-17T23:50:31.198Z",
          "message": "nyannAwooga"
        },
        {
          "timestamp": "2021-08-17T23:54:00.284Z",
          "message": "nyannPOG"
        }
      ]
    }

### Example Query with all fields

`GET /chat/nyanners?username=myusername&regex=vei&limit=2&skip=5`


### Response

    {
      "exec_time": 2.0527999997138977,
      "length": 2,
      "result": [
        {
          "timestamp": "2021-08-17T23:26:52.674Z",
          "message": "veiThink"
        },
        {
          "timestamp": "2021-08-17T23:27:02.362Z",
          "message": "veiS"
        }
      ]
    }


## Get service status

### Request

`GET /service/status`

### Response

    {
      "client": {
        "status": "Connected",
        "statusDetail": "irc-ws.chat.twitch.tv:443"
      },
      "db": {
        "collections": [
          "#sodapoppin",
          "#veibae",
          "#nyanners"
        ],
        "sessionCount": 1482,
        "data": [
          {
            "channel": "#veibae",
            "count": 633,
            "size": 94208
          },
          {
            "channel": "#sodapoppin",
            "count": 914,
            "size": 122880
          },
          {
            "channel": "#nyanners",
            "count": 10775,
            "size": 1110016
          }
        ]
      }
    }

## Get service config

### Request

`GET /service/config`

### Response

    {
      "debug": false,
      "channels": [
        "#sodapoppin",
        "#veibae",
        "#nyanners"
      ],
      "dbURL": "mongodb://mongo:27017/db",
      "maxQueryLimit": 500
    }

## Start logging a channel

### Request

`PUT /chat/:channel`

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8

## Stop logging a channel and remove data

### Request 

`DELETE /chat/:channel`

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
