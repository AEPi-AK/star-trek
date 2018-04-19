
import Express = require('express');
import Http = require('http');
import IO = require('socket.io');
import readline = require('readline');
import { ButtonState, HardwareState, Color, DEFAULT_HARDWARE_STATE, SwitchState, PlugboardState, KeypadState, RFIDScannerState } from '../../shared/HardwareTypes';
import { GameState, TaskTemplate, Task, FrequencyTaskType, GamePhase, HardwareCheck, ExclusionTaskType, GameDifficulty } from '../../shared/GameTypes';
import { isNumber } from 'util';
import { Socket } from 'dgram';

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


function stationOnline(label: string) {
  return clients.indexOf(label) >= 0;
}

var switchboard_performed = false;
function switchboardEnabled (c: Color) {
  return switchboard_performed || c == Color.None;
}
function switchboardStart () {
  switchboard_performed = true;
}


var task_templates : TaskTemplate[] = [
  {description: 'Press the flashing white button', name: 'button-white', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressWhiteButton,
    start: () => { io.sockets.emit('button-flash', 'stationB-white-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationB-white-button'); },
    enabled: s => stationOnline('stationB') && s.enabled.stationB_whiteButton, completed: s => s.stationB.whiteButton.pressed},
  {description: 'Press the flashing white button', name: 'button-white', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressWhiteButton,
    start: () => { io.sockets.emit('button-flash', 'stationC-white-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationC-white-button'); },
    enabled: s => stationOnline('stationC') && s.enabled.stationC_whiteButton, completed: s => s.stationC.whiteButton.pressed},
  {description: 'Press the flashing white button', name: 'button-white', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressWhiteButton,
    start: () => { io.sockets.emit('button-flash', 'stationD-white-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationD-white-button'); },
    enabled: s => stationOnline('stationD') && s.enabled.stationD_whiteButton, completed: s => s.stationD.whiteButton.pressed},
  {description: 'Press the flashing green button', name: 'button-green', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressGreenButton,
    start: () => { io.sockets.emit('button-flash', 'stationA-green-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationA-green-button'); },
    enabled: s => stationOnline('stationA') && s.enabled.stationA_greenButton, completed: s => s.stationA.greenButton.pressed},
  {description: 'Press the flashing green button', name: 'button-green', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressGreenButton,
    start: () => { io.sockets.emit('button-flash', 'stationC-green-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationC-green-button'); },
    enabled: s => stationOnline('stationC') && s.enabled.stationC_greenButton, completed: s => s.stationC.greenButton.pressed},
  {description: 'Press the flashing green button', name: 'button-green', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressGreenButton,
    start: () => { io.sockets.emit('button-flash', 'stationD-green-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationD-green-button'); },
    enabled: s => stationOnline('stationD') && s.enabled.stationD_greenButton, completed: s => s.stationD.greenButton.pressed},
   {description: 'Press the flashing yellow button', name: 'button-yellow', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressYellowButton,
    start: () => { io.sockets.emit('button-flash', 'stationA-yellow-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationA-yellow-button'); },
    enabled: s => stationOnline('stationA') && s.enabled.stationA_yellowButton, completed: s => s.stationA.yellowButton.pressed},
  {description: 'Press the flashing yellow button', name: 'button-yellow', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressYellowButton,
    start: () => { io.sockets.emit('button-flash', 'stationB-yellow-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationB-yellow-button'); },
    enabled: s => stationOnline('stationB') && s.enabled.stationB_yellowButton, completed: s => s.stationB.yellowButton.pressed},
  {description: 'Press the flashing yellow button', name: 'button-yellow', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressYellowButton,
    start: () => { io.sockets.emit('button-flash', 'stationC-yellow-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationBCyellow-button'); },
    enabled: s => stationOnline('stationC') && s.enabled.stationC_yellowButton, completed: s => s.stationC.yellowButton.pressed},
  {description: 'Press the flashing blue button', name: 'button-blue', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressBlueButton,
    start: () => { io.sockets.emit('button-flash', 'stationA-blue-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationA-blue-button'); },
    enabled: s => stationOnline('stationA') && s.enabled.stationA_blueButton, completed: s => s.stationA.blueButton.pressed},
  {description: 'Press the flashing blue button', name: 'button-blue', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressBlueButton,
    start: () => { io.sockets.emit('button-flash', 'stationB-blue-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationB-blue-button'); },
    enabled: s => stationOnline('stationB') && s.enabled.stationB_blueButton, completed: s => s.stationB.blueButton.pressed},
  {description: 'Press the flashing blue button', name: 'button-blue', frequencyType: FrequencyTaskType.PressButton, exclusionType: ExclusionTaskType.PressBlueButton,
    start: () => { io.sockets.emit('button-flash', 'stationD-blue-button'); }, end: () => { io.sockets.emit('button-stop-flash', 'stationD-blue-button'); },
    enabled: s => stationOnline('stationD') && s.enabled.stationD_blueButton, completed: s => s.stationD.blueButton.pressed},

  {description: 'Scan hand at Security', name: 'scan-hand', frequencyType: FrequencyTaskType.ScanHand, exclusionType: ExclusionTaskType.ScanHand,
    start: null, end: null,
    enabled: s => stationOnline('stationC') && s.enabled.stationC_touchpad, completed: (s) => s.stationC.touchpad.pressed},

  {description: 'Flip the orange and green colored switches to the down position', name: 'switch-green-orange-down', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationD') && stationOnline('stationB') && s.enabled.stationD_yellowSwitch && s.enabled.stationB_greenSwitch, completed: (s) => s.stationD.yellowSwitch.pressed && s.stationB.greenSwitch.pressed},
  {description: 'Flip the orange and green colored switches to the up position', name: 'switch-green-orange-up', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationD') && stationOnline('stationB') && s.enabled.stationD_yellowSwitch && s.enabled.stationB_greenSwitch, completed: (s) => !s.stationD.yellowSwitch.pressed && !s.stationB.greenSwitch.pressed},
  {description: 'Flip the orange and blue colored switches to the down position', name: 'switch-blue-orange-down', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationD') && stationOnline('stationC') && s.enabled.stationD_yellowSwitch && s.enabled.stationC_blueSwitch, completed: (s) => s.stationD.yellowSwitch.pressed && s.stationC.blueSwitch.pressed},
  {description: 'Flip the orange and blue colored switches to the up position', name: 'switch-blue-orange-up', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationD') && stationOnline('stationC') && s.enabled.stationD_yellowSwitch && s.enabled.stationC_blueSwitch, completed: (s) => !s.stationD.yellowSwitch.pressed && !s.stationC.blueSwitch.pressed},
  {description: 'Flip the orange and red colored switches to the down position', name: 'switch-red-orange-down', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationD') && stationOnline('stationA') && s.enabled.stationD_yellowSwitch && s.enabled.stationA_redSwitch, completed: (s) => s.stationD.yellowSwitch.pressed && s.stationA.redSwitch.pressed},
  {description: 'Flip the yellow and red colored switches to the up position', name: 'switch-red-orange-up', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationD') && stationOnline('stationA') && s.enabled.stationD_yellowSwitch && s.enabled.stationA_redSwitch, completed: (s) => !s.stationD.yellowSwitch.pressed && !s.stationA.redSwitch.pressed},
  {description: 'Flip the green and blue colored switches to the down position', name: 'switch-green-blue-down', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationB') && stationOnline('stationC') && s.enabled.stationB_greenSwitch && s.enabled.stationC_blueSwitch, completed: (s) => s.stationB.greenSwitch.pressed && s.stationC.blueSwitch.pressed},
  {description: 'Flip the green and blue colored switches to the up position', name: 'switch-green-blue-up', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationB') && stationOnline('stationC') && s.enabled.stationB_greenSwitch && s.enabled.stationC_blueSwitch, completed: (s) => !s.stationB.greenSwitch.pressed && !s.stationC.blueSwitch.pressed},
  {description: 'Flip the green and red colored switches to the down position', name: 'switch-red-green-down', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationB') && stationOnline('stationA') && s.enabled.stationB_greenSwitch && s.enabled.stationA_redSwitch, completed: (s) => s.stationB.greenSwitch.pressed && s.stationA.redSwitch.pressed},
  {description: 'Flip the green and red colored switches to the up position', name: 'switch-red-green-up', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationC') && stationOnline('stationA') && s.enabled.stationB_greenSwitch && s.enabled.stationA_redSwitch, completed: (s) => !s.stationB.greenSwitch.pressed && !s.stationA.redSwitch.pressed},
  {description: 'Flip the blue and red colored switches to the down position', name: 'switch-red-blue-down', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationC') && stationOnline('stationA') && s.enabled.stationA_redSwitch && s.enabled.stationC_blueSwitch, completed: (s) => s.stationA.redSwitch.pressed && s.stationC.blueSwitch.pressed},
  {description: 'Flip the blue and red colored switches to the up position', name: 'switch-red-blue-up', frequencyType: FrequencyTaskType.FlipSwitches, exclusionType: ExclusionTaskType.FlipSwitches,
    start: null, end: null,
    enabled: (s) => stationOnline('stationC') && stationOnline('stationA') && s.enabled.stationA_redSwitch && s.enabled.stationC_blueSwitch, completed: (s) => !s.stationA.redSwitch.pressed && !s.stationC.blueSwitch.pressed},

  {description: 'Plug the Red wire into the port labelled To at Operations', name: 'plug-red-to', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotTo), completed: (s) => s.stationB.plugboard.slotTo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled To at Operations', name: 'plug-blue-to', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotTo), completed: (s) => s.stationB.plugboard.slotTo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled To at Operations', name: 'plug-yellow-to', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotTo), completed: (s) => s.stationB.plugboard.slotTo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Too at Operations', name: 'plug-red-too', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotToo), completed: (s) => s.stationB.plugboard.slotToo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Too at Operations', name: 'plug-blue-too', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotToo), completed: (s) => s.stationB.plugboard.slotToo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Too at Operations', name: 'plug-yellow-too', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotToo), completed: (s) => s.stationB.plugboard.slotToo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled Two at Operations', name: 'plug-red-two', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotTwo), completed: (s) => s.stationB.plugboard.slotTwo == Color.Red},
  {description: 'Plug the Blue wire into the port labelled Two at Operations', name: 'plug-blue-two', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotTwo), completed: (s) => s.stationB.plugboard.slotTwo == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled Two at Operations', name: 'plug-yellow-two', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slotTwo), completed: (s) => s.stationB.plugboard.slotTwo == Color.Yellow},
  {description: 'Plug the Red wire into the port labelled 10 at Operations', name: 'plug-red-10', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slot10), completed: (s) => s.stationB.plugboard.slot10 == Color.Red},
  {description: 'Plug the Blue wire into the port labelled 10 at Operations', name: 'plug-blue-10', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slot10), completed: (s) => s.stationB.plugboard.slot10 == Color.Blue},
  {description: 'Plug the Yellow wire into the port labelled 10 at Operations', name: 'plug-yellow-10', frequencyType: FrequencyTaskType.Plugboard, exclusionType: ExclusionTaskType.Plugboard,
    start: switchboardStart, end: null,
    enabled: s => stationOnline('stationB') && s.enabled.stationB_plugboard && switchboardEnabled(s.stationB.plugboard.slot10), completed: (s) => s.stationB.plugboard.slot10 == Color.Yellow},

  {description: "Enter 2063 on the keypad", name: 'keypad-2063', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "2063"},
  {description: "Enter 9983 on the keypad", name: 'keypad-9983', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "9983"},
  {description: "Enter 0004 on the keypad", name: 'keypad-0004', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "0004"},
  {description: "Enter 7245 on the keypad", name: 'keypad-7245', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "7245"},
  {description: "Enter 8518 on the keypad", name: 'keypad-8518', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "8518"},
  {description: "Enter 9515 on the keypad", name: 'keypad-9515', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "9515"},
  {description: "Enter 7459 on the keypad", name: 'keypad-7459', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "7459"},
  {description: "Enter 3471 on the keypad", name: 'keypad-3471', frequencyType: FrequencyTaskType.ReadCode, exclusionType: ExclusionTaskType.Plugboard,
    start: null, end: null,
    enabled: s => stationOnline('stationA') && s.enabled.stationA_keypad, completed: (s) => s.stationA.keypad.currentString === "3471"},
  
  {description : "Scan James Kirk's ID card at Security", name: 'ID-name-kirk', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '15658116'},
  {description : "Scan the captain's ID", name: 'ID-role-captain', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '15658116'},
  {description : "Scan the ID with access level X", name: 'ID-level-X', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '15658116'},
  {description : "Scan Nyota Uhura's ID card", name: 'ID-name-uhura', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '251014852'}, 251014852
  {description : "Scan the ID with access level IV", name: 'ID-level-IV', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '251014852'},
  {description : "Scan Leonard Mccoy's ID card", name: 'ID-name-mccoy', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '10951066610'}, 10951066610
  {description : "Scan the ID with access level III", name: 'ID-level-iii', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '10951066610'},
  {description : "Scan Hikaru Sulu's ID card", name: 'ID-name-sulu', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '1062571092'}, 1062571092
  {description : "Scan the Lieutenant's ID card", name: 'ID-role-lieutenant', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '1062571092'},
  {description : "Scan the ID with acces level IX", name: 'ID-level-ix', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '1062571092'},
  {description : "Scan Chekov's ID card", name: 'ID-name-chekov', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '143121036'}, 
  {description : "Scan the Engineer's card", name: 'ID-role-engineer', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '143121036'},
  {description : "Scan the ID card with access level VI", name: 'ID-level-vi', frequencyType : FrequencyTaskType.ScanCard, exclusionType: ExclusionTaskType.ScanCard,
    start: null, end: null,
    enabled: s => stationOnline('stationD') && s.enabled.stationD_rfidScanner, completed: (s) => s.stationD.rfidScanner.cardID === '143121036'},
  
  {description : "Press the Big Red Button", name: 'big-red-button', frequencyType : FrequencyTaskType.PressBigButton, exclusionType: ExclusionTaskType.PressBigButton,
    start: () => { io.sockets.emit('button-flash', 'big-red-button')} , end: () => { io.sockets.emit('button-stop-flash', 'big-red-button'); },
    enabled: s => stationOnline('captains-chair') && s.enabled.bigRedButton, completed: (s) => s.bigRedButton.pressed}
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

var defaultDuration = {[GameDifficulty.PreEasy]: 30, [GameDifficulty.Easy]: 15, [GameDifficulty.Medium]: 10, [GameDifficulty.Hard]: 8}

var INITIAL_DURATIONS = {
  [FrequencyTaskType.PressButton] : defaultDuration,
  [FrequencyTaskType.ScanHand] : defaultDuration,
  [FrequencyTaskType.FlipSwitches] : defaultDuration,
  [FrequencyTaskType.Plugboard] : defaultDuration,
  [FrequencyTaskType.ReadCode] : defaultDuration,
  [FrequencyTaskType.ScanCard] : defaultDuration,
  [FrequencyTaskType.PressBigButton] : defaultDuration
}

var task_id = 0;

function startingGameState (): GameState{
  return {
    tasks: [],
    failures: 0,
    time: 120,
    difficulty: GameDifficulty.PreEasy,
    phase: GamePhase.EnterPlayers,
    weights : INITIAL_WEIGHTS,
    durations: INITIAL_DURATIONS,
    task_frequency: {[GameDifficulty.PreEasy]: 10, [GameDifficulty.Easy]: 5, [GameDifficulty.Medium]: 4, [GameDifficulty.Hard]: 3},
    max_tasks: {[GameDifficulty.PreEasy]: 2, [GameDifficulty.Easy]: 3, [GameDifficulty.Medium]: 4, [GameDifficulty.Hard]: 5},
  };
}

var game_state : GameState = startingGameState();
var number_of_players = 0;
function resetGameState () {
  game_state = {
    tasks: [],
    failures: 0,
    time: 120,
    difficulty: GameDifficulty.PreEasy,
    phase: GamePhase.EnterPlayers,
    weights: INITIAL_WEIGHTS,
    durations: game_state.durations,
    task_frequency: game_state.task_frequency,
    max_tasks: game_state.max_tasks,
   };
   switchboard_performed = false;
}

var MAX_FAILURES = 5;

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
  var time_to_complete = game_state.durations[template.frequencyType][game_state.difficulty];
  end_time.setSeconds(time.getSeconds() + time_to_complete);
  var id = task_id++;
  return {description: template.description, name: template.name, time_created: time.getTime(), time_expires: end_time.getTime(), id: id, exclusionType: template.exclusionType, start: template.start, end: template.end, enabled: template.enabled, completed: template.completed};
}

function createNewTask () {
  var template = pickRandomTaskTemplate();
  return createTaskFromTemplate(template);
}

function canCreateTask() {
  return task_templates.filter(taskTemplateValid).length > 0;
}

function completedTasks(tasks: Task[]) {
  if (game_state.difficulty === GameDifficulty.PreEasy) {
    game_state.difficulty = GameDifficulty.Easy;
    updatedGameState();
  }
  for (let task of tasks) {
    if (task.end) task.end();
  }
}

function switchToIntroVideo() {
  endPhase();
  game_state.phase = GamePhase.IntroVideo;
  updatedGameState();

  game_timer_ids.push(setTimeout(switchToPlayGame, 32000));
}

var game_timer_ids : NodeJS.Timer[] = [];
function switchToPlayGame() {
  endPhase();
  game_state.phase = GamePhase.PlayGame;
  for (let button in button_mapping) {
    io.sockets.emit('button-request-state', button);
  }

  var time_since_last_made = 30;
  game_timer_ids.push(setInterval(() => {
    time_since_last_made++;
    if (time_since_last_made >= game_state.task_frequency[game_state.difficulty] || (time_since_last_made >= 1 && game_state.tasks.length === 0)) {
      if (game_state.tasks.length < game_state.max_tasks[game_state.difficulty] && canCreateTask()) {
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
    var failed_tasks = game_state.tasks.filter(({time_expires : end}) => end < now.getTime());
    for (let task of failed_tasks) {
      if (task.end) {
        task.end();
      }
    }
    game_state.tasks = game_state.tasks.filter(({time_expires : end}) => end >= now.getTime());
    var new_failures = failed_tasks.length;
    if (new_failures > 0) {
      game_state.failures += new_failures;
      updatedGameState();
      if (game_state.failures > MAX_FAILURES) {
        switchToGameLost();
      }
    }
  }, 500));

  game_timer_ids.push(setInterval(() => {
    game_state.time -= 1;
    if (game_state.time == 75) {
      game_state.difficulty = GameDifficulty.Medium;
    } else if (game_state.time == 45) {
      game_state.difficulty = GameDifficulty.Hard;
    }
    if (game_state.time == 0) {
      switchToLateGame();
    } else {
      updatedGameState();
    }
  }, 1000));

  updatedGameState();
}

function endPhase () {
  for (let timer of game_timer_ids) {
    clearInterval(timer);
  }
  game_timer_ids = [];
}

function switchToLateGame () {
  endPhase();
  game_state.phase = GamePhase.LateGame;

  let buttons : string[] = [];
  if (stationOnline('stationA') && hardware_state.enabled.stationA_blueButton) buttons.push('stationA-blue-button'); 
  if (stationOnline('stationB') && hardware_state.enabled.stationB_blueButton) buttons.push('stationB-blue-button'); 
  if (stationOnline('stationD') && hardware_state.enabled.stationD_blueButton) buttons.push('stationD-blue-button'); 
  if (stationOnline('stationA') && hardware_state.enabled.stationA_greenButton) buttons.push('stationA-green-button'); 
  if (stationOnline('stationC') && hardware_state.enabled.stationC_greenButton) buttons.push('stationC-green-button'); 
  if (stationOnline('stationD') && hardware_state.enabled.stationD_greenButton) buttons.push('stationD-green-button'); 

  
  for (let button of buttons) {
    io.sockets.emit('button-flash', button);
  }

  let interval = setInterval(() => {
    let all_pressed = buttons.length > 0;
    for (let button of buttons) {
      if (!button_mapping[button](hardware_state).pressed) all_pressed = false;
    }
    if (all_pressed) {
      clearInterval(interval);
      switchToGameWon();
    }
  }, 100);

  game_timer_ids.push(interval);

  game_timer_ids.push(setTimeout(() => {
    clearInterval(interval);
    switchToGameWon();
  }, 20000));

  updatedGameState();
}

function switchToGameLost () {
  endPhase();
  game_state.phase = GamePhase.GameLost;
  updatedGameState();

  game_timer_ids.push(setTimeout(switchToEnterPlayers, 17000));
}

function switchToGameWon () {
  endPhase();
  game_state.phase = GamePhase.GameWon;
  updatedGameState();

  game_timer_ids.push(setTimeout(switchToEnterPlayers, 12000));
}

function stopFlashingButtons() {
  for (let button in button_mapping) {
    io.sockets.emit('button-stop-flash', button);
  }
}

function switchToEnterPlayers() {
  endPhase();
  resetGameState();
  stopFlashingButtons();
  updatedGameState();
}

function updatedGameState () {
  io.sockets.emit('game-state-updated', game_state);
}

function updatedHardwareState () {
  let old_length = game_state.tasks.length;
  game_state.tasks = game_state.tasks.filter((t) => !t.completed(hardware_state));
  let ended_tasks = game_state.tasks.filter((t) => t.completed(hardware_state));
  completedTasks(ended_tasks);
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
    if (game_state.phase === GamePhase.EnterPlayers) {
      switchToIntroVideo();
    }
  })

  socket.on('task-completed', (id : number) => {
    completedTasks(game_state.tasks.filter(({id: task_id}) => task_id === id));
    game_state.tasks = game_state.tasks.filter(({id : task_id}) => task_id !== id);
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
    switchToEnterPlayers();
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
    game_state.durations[x][game_state.difficulty] = game_state.durations[x][game_state.difficulty] + 1;
    updatedGameState();
  });

  socket.on('decrement-duration', (x: FrequencyTaskType) => {
    game_state.durations[x][game_state.difficulty] = Math.max(game_state.durations[x][game_state.difficulty] - 1, 0);
    updatedGameState();
  });

  socket.on('increment-frequency', () => {
    game_state.task_frequency[game_state.difficulty] = game_state.task_frequency[game_state.difficulty] + 1;
    updatedGameState();
  });

  socket.on('decrement-frequency', () => {
    game_state.task_frequency[game_state.difficulty] = Math.max(1, game_state.task_frequency[game_state.difficulty] - 1);
    updatedGameState();
  });

  socket.on('increment-max-tasks', () => {
    game_state.max_tasks[game_state.difficulty] = game_state.max_tasks[game_state.difficulty] + 1;
    updatedGameState();
  });

  socket.on('decrement-max-tasks', () => {
    game_state.max_tasks[game_state.difficulty] = Math.max(1, game_state.max_tasks[game_state.difficulty] - 1);
    updatedGameState();
  });

  socket.on('button-pressed', (s: ButtonState) => {
    if (!(s.label in button_mapping)) {
      console.log("wrong label %s", s.label);
      return;
    }
    var old_state = button_mapping[s.label](hardware_state);
    old_state.pressed = s.pressed;
    old_state.lit = s.lit;
    updatedHardwareState();
    console.log("recieved state %s %s", s.label, s.pressed ? "pressed" : "unpressed");
  });

  socket.on('button-state-response', (data: {label: string, pressed: boolean}) => {
    var old_state = button_mapping[data.label](hardware_state);
    old_state.pressed = data.pressed;
    updatedHardwareState();
    console.log("recieved state %s %s", data.label, data.pressed ? "pressed" : "unpressed");

  });

  socket.on('switchboard-update', (s: PlugboardState) => {
    hardware_state.stationB.plugboard = s;
    updatedHardwareState();
  });

  socket.on('captains-chair-keypad', (s: KeypadState) => {
    hardware_state.stationA.keypad = s;
    updatedHardwareState();
  });

  socket.on('captains-chair-scanner', (s: RFIDScannerState) => {
    hardware_state.stationD.rfidScanner= s;
    updatedHardwareState();
  });

  socket.on('switch-phase', () => {
    console.log('switch-phase');
    next_phase[game_state.phase]();
  });

  socket.on('toggle-hardware', (data: {name: string, enabled: boolean}) => {
    //@ts-ignore
    hardware_state.enabled[data.name] = data.enabled;
    console.log(hardware_state.enabled);
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
  'stationB-blue-switch' : s => s.stationB.greenSwitch,
  'stationC-green-switch': s => s.stationC.blueSwitch,
  'stationC-yellow-button': s => s.stationC.yellowButton,
  'stationC-white-button': s => s.stationC.whiteButton,
  'stationC-green-button': s => s.stationC.greenButton,
  'stationC-touchpad': s => s.stationC.touchpad,
  'stationD-white-button': s => s.stationD.whiteButton,
  'stationD-blue-button': s => s.stationD.blueButton,
  'stationD-green-button': s => s.stationD.greenButton,
  'stationD-yellow-switch': s => s.stationD.yellowSwitch,
  'big-red-button': s => s.bigRedButton
}

var next_phase: {[p: number]: (() => void) } = {
  [GamePhase.IntroVideo]: switchToPlayGame,
  [GamePhase.PlayGame]: switchToLateGame,
  [GamePhase.LateGame]: switchToGameWon,
  [GamePhase.GameWon]: switchToEnterPlayers,
  [GamePhase.GameLost]: switchToEnterPlayers,
  [GamePhase.EnterPlayers]: switchToIntroVideo
}