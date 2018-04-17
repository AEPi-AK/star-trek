"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var ws281x = require('rpi-ws281x-native');
var Socket = require("socket.io-client");
var GameTypes_1 = require("../../shared/GameTypes");
var NUM_LIGHTS = 20;
console.log('starting');
var socket = Socket(process.argv[2]);
var Color;
(function (Color) {
    Color[Color["None"] = 0] = "None";
    Color[Color["Purple"] = 16711935] = "Purple";
    Color[Color["Green"] = 65280] = "Green";
    Color[Color["Red"] = 16711680] = "Red";
    Color[Color["White"] = 16777215] = "White";
})(Color || (Color = {}));
socket.on('connect', function () {
    socket.emit('identification', 'game-lights');
    socket.on('game-state-updated', function (_a) {
        var phase = _a.phase;
        console.log('new phase: ', phase);
        if (phase === GameTypes_1.GamePhase.NotConnected) {
            setAllLightsToColor(Color.Purple);
        }
        else if (phase === GameTypes_1.GamePhase.GameWon) {
            setAllLightsToColor(Color.Green);
        }
        else if (phase === GameTypes_1.GamePhase.GameLost) {
            setAllLightsToColor(Color.Red);
        }
        else if (phase === GameTypes_1.GamePhase.FiringLaser) {
            setAllLightsToColor(Color.Red);
        }
        else if (phase === GameTypes_1.GamePhase.EnterPlayers) {
            setAllLightsToColor(Color.White);
        }
    });
});
function setAllLightsToColor(color) {
    var pixelData = new Uint32Array(NUM_LIGHTS);
    _.times(NUM_LIGHTS, function (i) {
        pixelData[i] = color;
    });
    ws281x.render(pixelData);
}
ws281x.init(NUM_LIGHTS, {
    // Use BCM Pin 18 (Pin #12, PWM0)
    // See here: https://github.com/jgarff/rpi_ws281x#gpio-usage
    gpioPin: 18,
    brightness: 255,
});
setAllLightsToColor(Color.White);
//# sourceMappingURL=index.js.map