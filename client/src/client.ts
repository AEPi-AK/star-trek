import Socket = require('socket.io-client');
import Readline = require('readline');
import { emitIdentification } from '../../common/messages';

var socket = Socket('http://localhost:3000');

const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
rl.question('What is your name? ', (answer) => {
  emitIdentification(socket, answer);
  rl.close();
});