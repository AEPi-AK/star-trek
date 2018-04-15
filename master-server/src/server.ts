import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import readline = require('readline');
import { ButtonState, HardwareState2, Color } from '../../shared/HardwareTypes';
import { GameState, TaskTemplate, Task, TaskType, GamePhase, HardwareCheck } from '../../shared/GameTypes';
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

function template(str : string, args : string[]) {
  var i = 0;
  return str.replace(/%s/g, () => { return args[i++]; });
}

// function substitute1 (str : string, p1 : string[], type : TaskType) {//, enabled: (p:string) => HardwareCheck, completed: (p:string) => HardwareCheck) {
//   return p1.map((arg) => ({description : template(str, [arg]), type : type, enabled: enabled(arg), completed: completed(arg)}));
// }

// function substitute2 (str : string, p1 : string[], p2 : string[], type : TaskType) {
//   var returns : TaskTemplate[] = [];
//   for (var poss1 of p1) {
//     for (var poss2 of p2) {
//       returns.push({description : template(str, [poss1, poss2]), type : type});
//     }
//   }
//   return returns;
// }

var tactical_enabled = (s: HardwareState2) => s.enabled.tactical;
var operations_enabled = (s: HardwareState2) => s.enabled.operations;
var navigation_enabled = (s: HardwareState2) => s.enabled.navigation;
var security_enabled = (s: HardwareState2) => s.enabled.security;

var task_templates : TaskTemplate[] = [
  {description: 'Press the Yellow colored button at Tactical', type: TaskType.PressButton, enabled: tactical_enabled, completed: (s: HardwareState2) => s.tactical.yellowButton.pressed},
  {description: 'Press the Green colored button at Tactical', type: TaskType.PressButton, enabled: tactical_enabled, completed: (s: HardwareState2) => s.tactical.greenButton.pressed},
  {description: 'Press the Blue colored button at Tactical', type: TaskType.PressButton, enabled: tactical_enabled, completed: (s: HardwareState2) => s.tactical.blueButton.pressed},

  {description: 'Press the Red colored button at Tactical', type: TaskType.PressButton, enabled: tactical_enabled, completed: (s) => s.tactical.redButton.pressed},
  {description: 'Press the Red colored button at Operations', type: TaskType.PressButton, enabled: operations_enabled, completed: (s) => s.operations.redButton.pressed},
  {description: 'Press the Red colored button at Navigation', type: TaskType.PressButton, enabled: navigation_enabled, completed: (s) => s.navigation.redButton.pressed},
  {description: 'Press the White colored button at Tactical', type: TaskType.PressButton, enabled: tactical_enabled, completed: (s) => s.tactical.whiteButton.pressed},
  {description: 'Press the White colored button at Operations', type: TaskType.PressButton, enabled: operations_enabled, completed: (s) => s.operations.whiteButton.pressed},
  {description: 'Press the White colored button at Navigation', type: TaskType.PressButton, enabled: navigation_enabled, completed: (s) => s.navigation.whiteButton.pressed},

  {description: 'Scan hand at Security', type: TaskType.ScanHand, enabled: security_enabled, completed: (s) => s.security.touchpad.pressedThreeSeconds},

  {description: 'Flip the yellow and green colored switches to the up position', type: TaskType.FlipSwitches, enabled: (s) => s.enabled.operations && s.enabled.navigation, completed: (s) => s.operations.yellowSwitch.up && s.navigation.greenSwitch.up},
  // 11 more like this

  {description: 'Plug the Red wire into the port labelled To at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotTo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled To at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotTo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled To at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotTo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Too at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotToo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Too at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotToo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Too at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotToo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Two at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotTwo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Two at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotTwo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Two at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slotTwo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled 10 at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slot10 == Color.Red},
  {description: 'Plug the Blue wire into the port labelled 10 at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slot10 == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled 10 at Operations', type: TaskType.Plugboard, enabled: operations_enabled, completed: (s) => s.operations.plugboard.slot10 == Color.Yellow},

  {description: "Read the code on the captain's chair.  Enter it on the keypad.", type: TaskType.ReadCode, enabled: operations_enabled, completed: (s) => s.operations.keypad.correct},

  {description : "Scan Montgomery Scott's ID card at Security", type : TaskType.ScanCard, enabled: security_enabled, completed: (s) => true},
  {description : "Scan the Engineer's ID card at Security", type : TaskType.ScanCard, enabled: security_enabled, completed: (s) => true},
  {description : "Scan an ID card with access level IV at Security", type : TaskType.ScanCard, enabled: security_enabled, completed: (s) => true},
  {description : "Press the Big Red Button", type : TaskType.PressBigButton, enabled: tactical_enabled, completed: (s) => s.tactical.bigRedButton.pressed}
]

// var task_templates : TaskTemplate[] = [
//   substitute1('Press the %s colored button at Tactical', ['Yellow', 'Green', 'Blue']),
//   substitute1('Press the button labelled %s at Tactical', ['Yellow', 'Green', 'Blue'], TaskType.PressButton),
//   substitute2('Press the %s colored button at %s', ['Red', 'White'], ['Tactical', 'Operations', 'Navigation'], TaskType.PressButton),
//   [{description : 'Scan hand at Security', type : TaskType.ScanHand}],
//   substitute2('Flip the %s colored switches to the %s position', 
//     ['Yellow and Green', 'Yellow and Blue', 'Yellow and Red', 'Green and Blue', 'Green and Red', 'Blue and Red'], ['up', 'down'], TaskType.FlipSwitches),
//   substitute2('Plug the %s wire into the port labelled %s at Operations', ['Red', 'Blue', 'Yellow'], ['To', 'Too', 'Two', '10'], TaskType.Plugboard),
//   substitute1("Read the code on the captain's chair (%s).  Enter it on the keypad.", ["", "", "", "", ""], TaskType.ReadCode),
//   [{description : "Scan Montgomery Scott's ID card at Security", type : TaskType.ScanCard}],
//   [{description : "Scan the Engineer's ID card at Security", type : TaskType.ScanCard}],
//   [{description : "Scan an ID card with access level IV at Security", type : TaskType.ScanCard}],
//   [{description : "Press the Big Red Button", type : TaskType.PressBigButton}]
// ].reduce((acc, cur) => acc.concat(cur));

var INITIAL_WEIGHTS = {
  [TaskType.PressButton] : 1,
  [TaskType.ScanHand] : 1,
  [TaskType.FlipSwitches] : 1,
  [TaskType.Plugboard] : 1,
  [TaskType.ReadCode] : 1,
  [TaskType.ScanCard] : 1,
  [TaskType.PressBigButton] : 1
}

var INITIAL_DURATIONS = {
  [TaskType.PressButton] : 10,
  [TaskType.ScanHand] : 10,
  [TaskType.FlipSwitches] : 10,
  [TaskType.Plugboard] : 10,
  [TaskType.ReadCode] : 10,
  [TaskType.ScanCard] : 10,
  [TaskType.PressBigButton] : 10
}

var task_id = 0;

var game_state : GameState = {
  tasks: [],
  failures: 0,
  time: 150,
  phase: GamePhase.EnterPlayers,
  weights : INITIAL_WEIGHTS,
  durations: INITIAL_DURATIONS,
  task_frequency: 5,
  max_tasks: 5,
};
var number_of_players = 0;
function resetGameState () {
  game_state = {
    tasks: [],
    failures: 0,
    time: 150,
    phase: GamePhase.EnterPlayers,
    weights: game_state.weights,
    durations: game_state.durations,
    task_frequency: game_state.task_frequency,
    max_tasks: game_state.max_tasks,
   };
}

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
    accum += 1/total * game_state.weights[task_templates[i].type];
    if (accum > rand) {
      for (var j = 0; j < task_templates.length; j++) {
        if (i !== j) {
          game_state.weights[j] += 1;
        }
      }
      return task_templates[i];
    }
  }
  console.log('Defaulting');
  return task_templates[task_templates.length - 1];
}

function createTaskFromTemplate (template : TaskTemplate) : Task {
  var time = new Date();
  var end_time = new Date();
  end_time.setSeconds(time.getSeconds() + game_state.durations[template.type]);
  var id = task_id++;
  return {description: template.description, time_created: time.getTime(), time_expires: end_time.getTime(), id: id};
}

function createNewTask () {
  var template = pickRandomTaskTemplate();
  return createTaskFromTemplate(template);
}

var game_timer_ids : NodeJS.Timer[] = [];
function startGame() {
  var time_since_last_made = 0;
  game_timer_ids.push(setInterval(() => {
    time_since_last_made++;
    if (time_since_last_made >= game_state.task_frequency || (time_since_last_made >= 1 && game_state.tasks.length === 0)) {
      if (game_state.tasks.length < game_state.max_tasks) {
        time_since_last_made = 0;
        var task = createNewTask();
        game_state.tasks.push(task);
        updatedGameState();
      }
    }
  }, 1000));
  
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



function updatedGameState () {
  io.sockets.emit('game-state-updated', game_state);
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

  socket.on('number-players', (num : number) => {
    number_of_players = num;
    if (game_state.phase != GamePhase.PlayGame) {
      game_state.phase = GamePhase.PlayGame;
      startGame();
      updatedGameState();
    }
  })

  socket.on('task-completed', (id : number) => {
    game_state.tasks = game_state.tasks.filter(({id : task_id}) => task_id != id);
    updatedGameState();
  })

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
    if (data == 'game-screen') {
      updatedGameState();
    }
  });

  socket.on('reset-game', () => {
    endGame();
  });

  socket.on('increment-probability', (x: TaskType) => {
    game_state.weights[x] = Math.min(game_state.weights[x] + 1, 10);
    updatedGameState();
  });

  socket.on('decrement-probability', (x: TaskType) => {
    game_state.weights[x] = Math.max(game_state.weights[x] - 1, 0);
    updatedGameState();
  });

  socket.on('increment-duration', (x: TaskType) => {
    game_state.durations[x] = game_state.durations[x] + 1;
    updatedGameState();
  });

  socket.on('decrement-duration', (x: TaskType) => {
    game_state.durations[x] = Math.max(game_state.durations[x] - 1, 0);
    updatedGameState();
  });

  socket.on('increment-frequency', () => {
    game_state.task_frequency = game_state.task_frequency + 1;
    updatedGameState();
  });

  socket.on('decrement-frequency', () => {
    game_state.task_frequency = Math.max(1, game_state.task_frequency - 1);
    updatedGameState();
  });

  socket.on('increment-max-tasks', () => {
    game_state.max_tasks = game_state.max_tasks + 1;
    updatedGameState();
  });

  socket.on('decrement-max-tasks', () => {
    game_state.max_tasks = Math.max(1, game_state.max_tasks - 1);
    updatedGameState();
  });
});