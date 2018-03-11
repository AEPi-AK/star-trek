import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import { onIdentification, onConnect, onDisconnect } from '../../common/serverMessages';

var app = Express();
var http = new Http.Server(app);
var io = IO(http);
var clients: string[] = new Array<string>();

onConnect(io, function(socket: SocketIO.Socket){
  var name: null | string = null;
  console.log('a user connected: ' + socket.id);

  onDisconnect(socket, function () {
    if (name) {
      console.log(name + ' disconnected');
      clients = clients.filter(e => e !== name);
      io.sockets.emit('clients-updated', clients);
    }
    else console.log(socket.id + ' disconnected');
  }); 

  onIdentification(socket, function (data: string) {
    if (name === null) {
      console.log('user ' + socket.id + ' identified as ' + data);
      name = data;
      clients.push(name);
      io.sockets.emit('clients-updated', clients);
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});