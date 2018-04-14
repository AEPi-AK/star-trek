import Socket = require('socket.io-client');
import rpio = require('rpio');
import readline = require('readline');
import Keypad from "./Keypad";


//import iohook = require('iohook');

console.log("Keypad started.");


var socket: SocketIOClient.Socket = Socket('http://localhost:3000');


socket.on('code', (target : string) => {
        function sendPacket (packet : any) {
            console.log(packet);
            socket.emit('task-completed', 98);
        }
        
        const keypad = new Keypad(sendPacket);
    });
