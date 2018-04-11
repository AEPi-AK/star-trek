import Socket = require('socket.io-client');

var socket = Socket('http://Meins-MacBook-Pro.local:3000');

socket.on('connect', () => {
  socket.emit('identification', 'Command line client');
});
