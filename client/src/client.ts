import Socket = require('socket.io-client');
import * as Types from '../../common/SocketIOTypes';

var socket: Types.ClientSocket = Socket('http://localhost:3000');

socket.on('connect', () => {
  socket.emit('identification', 'Command line client');
});

//@ts-ignore
socket.on('TEST', dat => console.log(dat));