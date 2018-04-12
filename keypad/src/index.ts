import Socket = require('socket.io-client');
import rpio = require('rpio');
import iohook = require('iohook');
import * as Types from '../../common/SocketIOTypes';

console.log("Keypad started.");

function keyPress(event : KeyboardEvent){
    console.log(event);
};

var socket: Types.ClientSocket = Socket('http://localhost:3000');

var translations: {[index:number]: number} = {
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

socket.on('players', () => {
    iohook.start(false);
    console.log("How many players are there?");
    iohook.on('keydown', event => {
        console.log(event.keycode);
        if(translations[event.keycode] != null){
            socket.emit('players', translations[event.keycode])
            iohook.stop();
        }
    });
});