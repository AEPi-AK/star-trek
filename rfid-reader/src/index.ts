import Socket = require('socket.io-client');
import rpio = require('rpio');
import readline = require('readline');
import Scanner from './Scanner';

console.log("rfid started.");

readline.emitKeypressEvents(process.stdin);


var socket: SocketIOClient.Socket = Socket(process.argv[2]);

socket.on('connect', () => {
    socket.emit('identification', 'keypad');
});

socket.on('rfid', (target: string) => {
    console.log("matching " + target);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    // rl.on('line', (input) => {
    //     if(input == target){
    //         console.log("matched!");
    //         socket.emit('rfid-match', true);
    //         rl.close();
    //     }

    // });

        
    function sendPacket (packet : any) {
        if(packet == target){
            console.log("matched!");
            socket.emit('task-completed', 99);
        } else {
            console.log("Received, not a match");
        }
    }

    const scanner = new Scanner(sendPacket);

});
