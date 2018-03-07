import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import { onIdentification, onConnect, onDisconnect } from '../../common/messages';

var app = Express();
var http = new Http.Server(app);
var io = IO(http);

onConnect(io, function(socket: SocketIO.Socket){
  var name: null | string = null;
  console.log('a user connected: ' + socket.id);

  onDisconnect(socket, function () {
    if (name) console.log(name + ' disconnected');
    else console.log(socket.id + ' disconnected');
  }); 

  onIdentification(socket, function (data: string) {
    if (name === null) {
     console.log('user ' + socket.id + ' identified as ' + data);
     name = data;
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});