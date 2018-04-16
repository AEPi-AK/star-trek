import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import readline = require('readline');
import { ButtonState, HardwareState, Color, DEFAULT_HARDWARE_STATE, SwitchState, PlugboardState } from '../../shared/HardwareTypes';
import { GameState, TaskTemplate, Task, FrequencyTaskType, GamePhase, HardwareCheck, ExclusionTaskType } from '../../shared/GameTypes';
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

var hardware_state = DEFAULT_HARDWARE_STATE();


var task_templates : TaskTemplate[] = [
  /*
  {description: 'Press the Yellow colored button at Tactical', type: TaskType.PressButton, enabled: s => s.enabled.tactical.yellowButton, completed: s => s.tactical.yellowButton.pressed},
  {description: 'Press the Green colored button at Tactical', type: TaskType.PressButton, enabled: s => s.enabled.tactical.greenButton, completed: s => s.tactical.greenButton.pressed},
  {description: 'Press the Blue colored button at Tactical', type: TaskType.PressButton, enabled: s => s.enabled.tactical.blueButton, completed: s => s.tactical.blueButton.pressed},

  {description: 'Press the Red colored button at Tactical', type: TaskType.PressButton, enabled: s => s.enabled.tactical.redButton, completed: (s) => s.tactical.redButton.pressed},
  {description: 'Press the Red colored button at Operations', type: TaskType.PressButton, enabled: s => s.enabled.operations.redButton, completed: (s) => s.stationA.redButton.pressed},
  {description: 'Press the Red colored button at Navigation', type: TaskType.PressButton, enabled: s => s.enabled.navigation.redButton, completed: (s) => s.stationD.greenButton.pressed},
  {description: 'Press the White colored button at Tactical', type: TaskType.PressButton, enabled: s => s.enabled.tactical.whiteButton, completed: (s) => s.tactical.whiteButton.pressed},
  {description: 'Press the White colored button at Operations', type: TaskType.PressButton, enabled: s => s.enabled.operations.whiteButton, completed: (s) => s.operations.whiteButton.pressed},
  {description: 'Press the White colored button at Navigation', type: TaskType.PressButton, enabled: s => s.enabled.navigation.whiteButton, completed: (s) => s.stationD.whiteButton.pressed},

  {description: 'Scan hand at Security', type: TaskType.ScanHand, enabled: s => s.enabled.security.touchpad, completed: (s) => s.security.touchpad.pressedThreeSeconds},

  {description: 'Flip the yellow and green colored switches to the up position', type: TaskType.FlipSwitches, enabled: (s) => s.enabled.operations.yellowSwitch && s.enabled.navigation.greenSwitch, completed: (s) => s.operations.yellowSwitch.up && s.stationD.orangeSwitch.up},
  {description: 'Flip the yellow and green colored switches to the down position', type: TaskType.FlipSwitches, enabled: (s) => s.enabled.operations.yellowSwitch && s.enabled.navigation.greenSwitch, completed: (s) => !s.operations.yellowSwitch.up && !s.stationD.orangeSwitch.up},
  {description: 'Flip the yellow and blue colored switches to the up position', type: TaskType.FlipSwitches, enabled: (s) => s.enabled.operations.yellowSwitch && s.enabled.security.blueSwitch, completed: (s) => s.operations.yellowSwitch.up && s.security.blueSwitch.up},
  {description: 'Flip the yellow and blue colored switches to the down position', type: TaskType.FlipSwitches, enabled: (s) => s.enabled.operations.yellowSwitch && s.enabled.security.blueSwitch, completed: (s) => !s.operations.yellowSwitch.up && !s.security.blueSwitch.up},

  // 11 more like this

  {description: 'Plug the Red wire into the port labelled To at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotTo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled To at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotTo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled To at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotTo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Too at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotToo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Too at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotToo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Too at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotToo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Two at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotTwo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Two at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotTwo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Two at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slotTwo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled 10 at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slot10 == Color.Red},
  {description: 'Plug the Blue wire into the port labelled 10 at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slot10 == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled 10 at Operations', type: TaskType.Plugboard, enabled: s => s.enabled.operations.plugboard, completed: (s) => s.operations.plugboard.slot10 == Color.Yellow},

  {description: "Read the code on the captain's chair.  Enter it on the keypad.", type: TaskType.ReadCode, enabled: s => s.enabled.operations.keypad, completed: (s) => s.operations.keypad.correct},

  {description : "Scan Montgomery Scott's ID card at Security", type : TaskType.ScanCard, enabled: s => s.enabled.security.rfidScanner, completed: (s) => true},
  {description : "Scan the Engineer's ID card at Security", type : TaskType.ScanCard, enabled: s => s.enabled.security.rfidScanner, completed: (s) => true},
  {description : "Scan an ID card with access level IV at Security", type : TaskType.ScanCard, enabled: s => s.enabled.security.rfidScanner, completed: (s) => true},
  {description : "Press the Big Red Button", type : TaskType.PressBigButton, enabled: s => s.enabled.tactical.bigRedButton, completed: (s) => s.tactical.bigRedButton.pressed}
  */
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


var task_templates : TaskTemplate[] = [
  {description: 'Press the flashing white button', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressWhiteButton,
    start: () => { io.sockets.emit('button-flash', 'stationB-white-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationB-white-button'); }, 
    enabled: s => s.enabled.stationB.whiteButton, completed: s => s.stationB.whiteButton.pressed},
  {description: 'Press the flashing white button', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressWhiteButton,
    start: () => { io.sockets.emit('button-flash', 'stationC-white-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationC-white-button'); }, 
    enabled: s => s.enabled.stationC.whiteButton, completed: s => s.stationC.whiteButton.pressed},
    
  {description: 'Scan hand at Security', frequencyType: FrequencyTaskType.ScanHand, exclusionType: ExclusionTaskType.ScanHand,
    start: null, end: null,
    enabled: s => s.enabled.stationC.touchpad, completed: (s) => s.stationC.touchpad.pressed},

  {description: 'Flip the yellow and green colored switches to the up position', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => s.enabled.stationD.yellowSwitch && s.enabled.stationB.greenSwitch, completed: (s) => s.stationD.yellowSwitch.pressed && s.stationB.greenSwitch.pressed},
  {description: 'Flip the yellow and green colored switches to the down position', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => s.enabled.stationD.yellowSwitch && s.enabled.stationB.greenSwitch, completed: (s) => !s.stationD.yellowSwitch.pressed && !s.stationB.greenSwitch.pressed},
  {description: 'Flip the yellow and blue colored switches to the up position', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => s.enabled.stationD.yellowSwitch && s.enabled.stationC.blueSwitch, completed: (s) => s.stationD.yellowSwitch.pressed && s.stationC.blueSwitch.pressed},
  {description: 'Flip the yellow and blue colored switches to the down position', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => s.enabled.stationD.yellowSwitch && s.enabled.stationC.blueSwitch, completed: (s) => !s.stationD.yellowSwitch.pressed && !s.stationC.blueSwitch.pressed},
  // more

  {description: 'Plug the Red wire into the port labelled To at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotTo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled To at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotTo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled To at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotTo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Too at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotToo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Too at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotToo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Too at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotToo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Two at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotTwo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Two at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotTwo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Two at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slotTwo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled 10 at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slot10 == Color.Red},
  {description: 'Plug the Blue wire into the port labelled 10 at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slot10 == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled 10 at Operations', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationB.plugboard, completed: (s) => s.stationB.plugboard.slot10 == Color.Yellow},

  {description: "Read the code on the captain's chair.  Enter it on the keypad.", frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => s.enabled.stationA.keypad, completed: (s) => false},

  {description : "Scan Montgomery Scott's ID card at Security", frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => s.enabled.stationC.touchpad, completed: (s) => true},
  {description : "Scan the Engineer's ID card at Security", frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => s.enabled.stationC.touchpad, completed: (s) => true},
  {description : "Scan an ID card with access level IV at Security", frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => s.enabled.stationC.touchpad, completed: (s) => true},
  {description : "Press the Big Red Button", frequencyType : FrequencyTaskType.PressBigButton, exclusionType: ExclusionTaskType.PressBigButton,
    start: null, end: null,
    enabled: s => s.enabled.bigRedButton, completed: (s) => s.bigRedButton.pressed}
]

var INITIAL_WEIGHTS = {
  [FrequencyTaskType.PressButton] : 1,
  [FrequencyTaskType.ScanHand] : 1,
  [FrequencyTaskType.FlipSwitches] : 1,
  [FrequencyTaskType.Plugboard] : 1,
  [FrequencyTaskType.ReadCode] : 1,
  [FrequencyTaskType.ScanCard] : 1,
  [FrequencyTaskType.PressBigButton] : 1
}

var INITIAL_DURATIONS = {
  [FrequencyTaskType.PressButton] : 10,
  [FrequencyTaskType.ScanHand] : 10,
  [FrequencyTaskType.FlipSwitches] : 10,
  [FrequencyTaskType.Plugboard] : 10,
  [FrequencyTaskType.ReadCode] : 10,
  [FrequencyTaskType.ScanCard] : 10,
  [FrequencyTaskType.PressBigButton] : 10
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

function taskTemplateValid(task : TaskTemplate) {
  return task.enabled(hardware_state) && !task.completed(hardware_state) && game_state.tasks.filter(({exclusionType: t}) => t === task.exclusionType).length === 0;
}

function pickRandomTaskTemplate () : TaskTemplate {
  var valid_tasks = task_templates.filter(taskTemplateValid);

  //@ts-ignore
  var type_keys : number[] = Object.keys(FrequencyTaskType).filter(k => typeof FrequencyTaskType[k as any] === "number").map(k => FrequencyTaskType[k as any]);
  var counts : {[t : number] : number} = {};
  for (var template of valid_tasks) {
    if (counts[template.frequencyType]) {
      counts[template.frequencyType] += 1;
    } 
    else {
      counts[template.frequencyType] = 1;
    }
  }
  var total = 0;
  for (let k of Object.keys(counts)) {
    total += game_state.weights[Number(k)]
  }
  var accum = 0;
  var rand = Math.random();
  for (var i = 0; i < valid_tasks.length; i++) {
    accum += 1/total * 1/counts[valid_tasks[i].frequencyType] * game_state.weights[valid_tasks[i].frequencyType];
    if (accum > rand) {
      for (var j = 0; j < type_keys.length; j++) {
        if (i !== j) {
          game_state.weights[j] += 1;
        }
      }
      return valid_tasks[i];
    }
  }
  console.log('Defaulting');
  return valid_tasks[Math.floor(Math.random() * valid_tasks.length)];
}

function createTaskFromTemplate (template : TaskTemplate) : Task {
  var time = new Date();
  var end_time = new Date();
  end_time.setSeconds(time.getSeconds() + game_state.durations[template.frequencyType]);
  var id = task_id++;
  return {description: template.description, time_created: time.getTime(), time_expires: end_time.getTime(), id: id, exclusionType: template.exclusionType, start: template.start, end: template.end, enabled: template.enabled, completed: template.completed};
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
        if (task.start) {
          task.start();
        }
        game_state.tasks.push(task);
        updatedGameState();
      }
    }
  }, 1000));
  
  game_timer_ids.push(setInterval(() => {
    var now = new Date();
    var old_length = game_state.tasks.length;
    var ended_tasks = game_state.tasks.filter(({time_expires : end}) => end < now.getTime());
    for (let task of ended_tasks) {
      if (task.end) {
        task.end();
      }
    }
    game_state.tasks = game_state.tasks.filter(({time_expires : end}) => end >= now.getTime());
    var new_failures = ended_tasks.length;
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

function updatedHardwareState () {
  let old_length = game_state.tasks.length;
  game_state.tasks = game_state.tasks.filter((t) => !t.completed(hardware_state));
  console.log(hardware_state);
  if (old_length != game_state.tasks.length) {
    updatedGameState();
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

  socket.on('increment-probability', (x: FrequencyTaskType) => {
    game_state.weights[x] = Math.min(game_state.weights[x] + 1, 10);
    updatedGameState();
  });

  socket.on('decrement-probability', (x: FrequencyTaskType) => {
    game_state.weights[x] = Math.max(game_state.weights[x] - 1, 0);
    updatedGameState();
  });

  socket.on('increment-duration', (x: FrequencyTaskType) => {
    game_state.durations[x] = game_state.durations[x] + 1;
    updatedGameState();
  });

  socket.on('decrement-duration', (x: FrequencyTaskType) => {
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

  socket.on('button-pressed', (s: ButtonState) => {
    var old_state = button_mapping[s.label](hardware_state);
    old_state.pressed = s.pressed;
    old_state.lit = s.lit;
    updatedHardwareState();
  });

  socket.on('switchboard-update', (s: PlugboardState) => {
    hardware_state.stationB.plugboard = s;
    updatedHardwareState();
  });
});

var button_mapping : {[s: string]: (p: HardwareState) => ButtonState} = {
  'stationA-red-switch': s => s.stationA.redSwitch,
  'stationA-blue-button': s => s.stationA.blueButton,
  'stationA-green-button': s => s.stationA.greenButton,
  'stationA-yellow-button': s => s.stationA.yellowButton,
  'stationB-white-button': s => s.stationB.whiteButton,
  'stationB-blue-button': s => s.stationB.blueButton,
  'stationB-yellow-button': s => s.stationB.yellowButton,
  'stationB-green-switch' : s => s.stationB.greenSwitch,
  'stationC-blue-switch': s => s.stationC.blueSwitch,
  'stationC-yellow-button': s => s.stationC.yellowButton,
  'stationC-white-button': s => s.stationC.whiteButton,
  'stationC-green-button': s => s.stationC.greenButton,
  'stationC-touchpad': s => s.stationC.touchpad,
  'stationD-white-button': s => s.stationD.whiteButton,
  'stationD-blue-button': s => s.stationD.blueButton,
  'stationD-green-button': s => s.stationD.greenButton,
  'stationD-yellow-switch': s => s.stationD.yellowSwitch,
}
