import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import readline = require('readline');
import { ButtonState } from '../../shared/HardwareTypes';
import { GameState, TaskTemplate, Task } from '../../shared/GameTypes';

var app = Express();
var http = new Http.Server(app);
var io = IO(http, {'pingInterval': 2000, 'pingTimeout': 5000});
var clients: string[] = new Array<string>();


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


function template(str : string, args : string[]) {
  var i = 0;
  return str.replace(/%s/g, () => { return args[i++]; });
}

function substitute1 (str : string, p1 : string[]) {
  return p1.map((arg) => template(str, [arg]));
}

function substitute2 (str : string, p1 : string[], p2 : string[]) {
  var returns : string[] = [];
  for (var poss1 of p1) {
    for (var poss2 of p2) {
      returns.push(template(str, [poss1, poss2]));
    }
  }
  return returns;
}

var task_descriptions = [
  substitute1('Press the %s colored button at Tactical', ['Y', 'G', 'B']),
  substitute1('Press the button labelled %s at Tactical', ['Y', 'G', 'B']),
  substitute2('Press the %s colored button at %s', ['Red', 'White'], ['Tactical', 'Operations', 'Navigation']),
  ['Scan hand at Security']
  // add more
].reduce((acc, cur) => acc.concat(cur));

var task_templates : TaskTemplate [] = task_descriptions.map((desc) => { return {description : desc}; });
var task_id = 0;


function createTaskFromTemplate (template : TaskTemplate) : Task {
  var time = new Date();
  var end_time = new Date();
  end_time.setSeconds(time.getSeconds() + 10);
  var id = task_id++;
  return {description : template.description, time_created: time, time_expires : end_time, id : id};
}

function createNewTask () {
  var template = task_templates[Math.floor(Math.random() * task_templates.length)];
  return createTaskFromTemplate(template);
}

var game_state : GameState = {tasks : [], failures : 0, time : 200};



// game-state-updated: server -> console
// task-completed : console -> server



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
  socket.on('players', numberOfPlayers => { console.log('number of players:', numberOfPlayers)});
  //@ts-ignore
  socket.on('rfid-match', event => { console.log("matched"); });

  function updatedGameState () {
    socket.emit('game-state-updated', game_state);
    console.log(game_state);
  }

  socket.on('task-completed', (id) => {
    game_state.tasks = game_state.tasks.filter(({id : task_id}) => task_id != id);
    updatedGameState();
  })
  
  setInterval(() => {
    var task = createNewTask();
    game_state.tasks.push(task);
    updatedGameState();
  }, 5000);

  setInterval(() => {
    var now = new Date();
    var old_length = game_state.tasks.length;
    game_state.tasks = game_state.tasks.filter(({time_expires : end}) => end >= now);
    var new_failures = old_length - game_state.tasks.length;
    if (new_failures > 0) {
      game_state.failures += new_failures;
      updatedGameState();
    }
  }, 500);

  setInterval(() => {
    game_state.time -= 1;
    updatedGameState();
  }, 1000);
});