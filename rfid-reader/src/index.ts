import Socket = require('socket.io-client');
import rpio = require('rpio');
import readline = require('readline');

console.log("rfid started.");

  

function keyPress(event : KeyboardEvent){
    console.log(event);
};

var socket = Socket('http://localhost:3000');

var translations = {
    71: 7,
    72: 8,
    73: 9,
    75: 4,
    76: 5,
    77: 6,
    79: 1,
    80: 2,
    81: 3,
};

//@ts-ignore
socket.on('rfid', (target) => {
    console.log("matching " + target);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on('line', (input) => {
        if(input == target){
            console.log("matched!");
            //@ts-ignore
            socket.emit('rfid-match',{});
            rl.close();
        }

    });

});

