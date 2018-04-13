import Socket = require('socket.io-client');
import rpio = require('rpio');
import readline = require('readline');


//import iohook = require('iohook');
console.log("Keypad started.");

readline.emitKeypressEvents(process.stdin);

//@ts-ignore
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
  }
});

//process.stdin.on('keypress', (ch, key) => {console.log("keypress found", ch);});

var socket = Socket('http://localhost:3000');


/*
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
*/
//@ts-ignore
socket.on('PLAYERS', () => {
    //@ts-ignore
    process.stdin.setRawMode(true);
    process.stdin.resume();
    console.log("How many players are there?");
    process.stdin.on('keypress', (ch,key) => {
        console.log(ch);
        if(!isNaN(ch)){
            //@ts-ignore
            socket.emit('players', parseInt(ch));
            process.stdin.removeAllListeners('keypress');
            //@ts-ignore
        }
    });
});