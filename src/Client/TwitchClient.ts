import tmi from 'tmi.js'

const client = new tmi.Client({
    options: {debug: true },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: "placeholderlol",
        password: 'don\'t put a token here :) '
    },
    channels: [ 'sodapoppin' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if(self) { return; }
});