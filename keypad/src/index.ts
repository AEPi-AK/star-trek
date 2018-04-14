import Socket = require('socket.io-client');
import rpio = require('rpio');
import readline = require('readline');
import Keypad from "./Keypad";


//import iohook = require('iohook');

console.log("Keypad started.");


var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

const sequence:number[] = [];

socket.on('code', (target : string) => {
        function sendPacket (packet : any) {
            console.log(packet);
            sequence.shift();
            sequence.push(packet.key);
            if(sequence.join("") == target){
                socket.emit('task-completed', 98);
            } else {
                console.log("Not yet. Currently, the sequence is", sequence)
            }
        }
        
        const keypad = new Keypad(sendPacket);
    });
