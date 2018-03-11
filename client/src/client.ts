import Socket = require('socket.io-client');
import { emitIdentification } from '../../common/clientMessages';

var socket = Socket('http://localhost:3000');

socket.on('connect', () => {
  emitIdentification(socket, 'Command line client');
});