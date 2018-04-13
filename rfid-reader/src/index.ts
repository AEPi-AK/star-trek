import Socket = require('socket.io-client');
import rpio = require('rpio');
import readline = require('readline');

console.log("rfid started.");

  

function keyPress(event : KeyboardEvent){
    console.log(event);
};

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

socket.on('rfid', (target: string) => {
    console.log("matching " + target);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on('line', (input) => {
        if(input == target){
            console.log("matched!");
            socket.emit('rfid-match', true);
            rl.close();
        }

    });

});

