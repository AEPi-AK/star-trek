import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import readline = require('readline');
import { ButtonState } from '../../shared/HardwareTypes';
import { GameState, TaskTemplate, Task, TaskType, GamePhase } from '../../shared/GameTypes';
import { isNumber } from 'util';

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

function substitute1 (str : string, p1 : string[], type : TaskType) {
  return p1.map((arg) => ({description : template(str, [arg]), type : type}));
}

function substitute2 (str : string, p1 : string[], p2 : string[], type : TaskType) {
  var returns : TaskTemplate[] = [];
  for (var poss1 of p1) {
    for (var poss2 of p2) {
      returns.push({description : template(str, [poss1, poss2]), type : type});
    }
  }
  return returns;
}

var task_templates : TaskTemplate[] = [
  substitute1('Press the %s colored button at Tactical', ['Y', 'G', 'B'], TaskType.PressButton),
  substitute1('Press the button labelled %s at Tactical', ['Y', 'G', 'B'], TaskType.PressButton),
  substitute2('Press the %s colored button at %s', ['Red', 'White'], ['Tactical', 'Operations', 'Navigation'], TaskType.PressButton),
  [{description : 'Scan hand at Security', type : TaskType.ScanHand}],
  substitute2('Flip the %s colored switches to the %s position', 
    ['Y and G', 'Y and B', 'Y and R', 'G and B', 'G and R', 'B and R'], ['up', 'down'], TaskType.FlipSwitches),
  substitute2('Plug the %s wire into the port labelled %s at Operations', ['Red', 'Blue', 'Yellow'], ['To', 'Too', 'Two', '10'], TaskType.Plugboard),
  [{description : "Read the code on the captain's chair.  Enter it on the keypad.", type : TaskType.ReadCode}],
  [{description : "Scan Montgomery Scott's ID card at Security", type : TaskType.ScanCard}],
  [{description : "Scan the Engineer's ID card at Security", type : TaskType.ScanCard}],
  [{description : "Scan an ID card with access level IV at Security", type : TaskType.ScanCard}],
  [{description : "Press the Big Red Button", type : TaskType.PressBigButton}]
].reduce((acc, cur) => acc.concat(cur));

var weights = {
  [TaskType.PressButton] : 1,
  [TaskType.ScanHand] : 1,
  [TaskType.FlipSwitches] : 1,
  [TaskType.Plugboard] : 1,
  [TaskType.ReadCode] : 1,
  [TaskType.ScanCard] : 1,
  [TaskType.PressBigButton] : 1
}

var task_id = 0;

function pickRandomTaskTemplate () : TaskTemplate {
  //@ts-ignore
  var type_keys : number[] = Object.keys(TaskType).filter(k => typeof TaskType[k as any] === "number").map(k => TaskType[k as any]);
  var counts : {[t : number] : number} = {};
  for (var template of task_templates) {
    if (counts[template.type]) {
      counts[template.type] += 1;
    } 
    else {
      counts[template.type] = 1;
    }
  }
  var total = 0;
  for (var type of type_keys) {
    total += counts[type] || 0;
  }
  var accum = 0;
  var rand = Math.random();
  for (var i = 0; i < task_templates.length; i++) {
    accum += 1/total * weights[task_templates[i].type];
    if (accum > rand) return task_templates[i];
  }
  return task_templates[task_templates.length - 1];
}

function createTaskFromTemplate (template : TaskTemplate) : Task {
  var time = new Date();
  var end_time = new Date();
  end_time.setSeconds(time.getSeconds() + 10);
  var id = task_id++;
  return {description : template.description, time_created: time.getTime(), time_expires : end_time.getTime(), id : id};
}

function createNewTask () {
  var template = pickRandomTaskTemplate();
  return createTaskFromTemplate(template);
}

var game_state : GameState = {tasks : [], failures : 0, time : 200, phase : GamePhase.EnterPlayers};
var number_of_players = 0;
function resetGameState () {
  game_state = {tasks : [], failures : 0, time : 200, phase : GamePhase.EnterPlayers};
}

io.sockets.on('number-players', (num : number) => {
  number_of_players = num;
  game_state.phase = GamePhase.PlayGame;
  startGame();
  updatedGameState();
})

var game_timer_ids : NodeJS.Timer[] = [];
function startGame() {
  game_timer_ids.push(setInterval(() => {
    var task = createNewTask();
    game_state.tasks.push(task);
    updatedGameState();
  }, 10000 / number_of_players));
  
  game_timer_ids.push(setInterval(() => {
    var now = new Date();
    var old_length = game_state.tasks.length;
    game_state.tasks = game_state.tasks.filter(({time_expires : end}) => end >= now.getTime());
    var new_failures = old_length - game_state.tasks.length;
    if (new_failures > 0) {
      game_state.failures += new_failures;
      updatedGameState();
    }
  }, 500));
  
  game_timer_ids.push(setInterval(() => {
    console.log("called");
    game_state.time -= 1;
    if (game_state.time == 0) {
      endGame();
    } else {
      updatedGameState();
    }
  }, 1000));
}

function endGame () {
  for (var timer of game_timer_ids) {
    clearInterval(timer);
  }
  resetGameState();
  updatedGameState();
}

io.sockets.on('task-completed', (id : number) => {
  game_state.tasks = game_state.tasks.filter(({id : task_id}) => task_id != id);
  updatedGameState();
})

function updatedGameState () {
  io.sockets.emit('game-state-updated', game_state);
  console.log(game_state);
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
  socket.on('players', numberOfPlayers => { console.log('number of players:', numberOfPlayers)});
  //@ts-ignore
  socket.on('rfid-match', event => { console.log("matched"); });


});