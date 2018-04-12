import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import readline = require('readline');
import { ButtonState } from '../../common/HardwareTypes';

var app = Express();
var http = new Http.Server(app);
var io = IO(http, {'pingInterval': 2000, 'pingTimeout': 5000});
var clients: string[] = new Array<string>();

declare module 'socket.io' {
  interface Namespace extends NodeJS.EventEmitter {
      emit(event: 'clients-updated', data: string[]): boolean;
  }

  interface Socket extends NodeJS.EventEmitter {
    on(event: 'identification', fn: (data: string) => void): this;
		on(event: 'disconnect', fn: () => void): this;
		on(event: 'button-pressed', fn : (obj : ButtonState) => void): this;
  }
}

io.on('connect', function(socket: SocketIO.Socket){
  var name: null | string = null;
  console.log('a user connected: ' + socket.id);

  socket.on('disconnect', function () {
    if (name) {
      console.log(name + ' disconnected');
      clients = clients.filter(e => e !== name);
      io.sockets.emit('clients-updated', clients);
    }
    else console.log(socket.id + ' disconnected');
  }); 

  socket.on('identification', function (data: string) {
    if (name === null) {
      console.log('user ' + socket.id + ' identified as ' + data);
      name = data;
      clients.push(name);
      io.sockets.emit('clients-updated', clients);
    }
    if (data === 'button-1') {
      console.log("connecting...");
      socket.emit('button-listen', 'button3');
      socket.on('button-pressed', (obj : {pressed: boolean, label: string, lit : boolean}) => {
        console.log("button %s now %s", obj.label, obj.pressed ? "pressed" : "unpressed");
      });
    }
  });

  //@ts-ignore
  socket.on('players', things => { console.log(things)});
  //@ts-ignore
  socket.on('rfid-match', event => { console.log("matched"); });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sendMessage() {
  rl.question('Send message on channel: ', (chan) => {
    // TODO: Log the answer in a database
    rl.question('With data: ', (dat) => {
      //@ts-ignore
      io.sockets.emit(chan, dat);
      console.log("Sending data: " + dat + " on channel " + chan);
      sendMessage();
    });
  });
}

sendMessage();