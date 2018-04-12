import Socket = require('socket.io-client');
import rpio = require('rpio');
import iohook = require('iohook');
console.log("Keypad started.");

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
socket.on('PLAYERS', () => {
    iohook.start(false);
    console.log("How many players are there?");
    iohook.on('keydown', event => {
        console.log(event.keycode);
        //@ts-ignore
        if(translations[event.keycode]!=null){
            //@ts-ignore
            socket.emit('players', translations[event.keycode])
            iohook.stop();
        }
    });
});