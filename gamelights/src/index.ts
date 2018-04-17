import * as _ from 'lodash';
const ws281x = require('rpi-ws281x-native');
import Socket = require('socket.io-client');

import { GameState, GamePhase } from '../../shared/GameTypes';

const NUM_LIGHTS = 20;

console.log('starting');

var socket: SocketIOClient.Socket = Socket(process.argv[2]);

enum Color {
  None = 0,
  Purple = 0xff00ff,
  Green = 0x00ff00,
  Red = 0xff0000,
  White = 0xffffff,
}

socket.on('connect', () => {
  socket.emit('identification', 'game-lights');

  socket.on('game-state-updated', ({ phase }: GameState) => {
    console.log('new phase: ', phase);
    if (phase === GamePhase.NotConnected) {
      setAllLightsToColor(Color.Purple);
    } else if (phase === GamePhase.GameWon) {
      setAllLightsToColor(Color.Green);
    } else if (phase === GamePhase.GameLost) {
      setAllLightsToColor(Color.Red);
    } else if (phase === GamePhase.FiringLaser) {
      setAllLightsToColor(Color.Red);
    } else if (phase === GamePhase.EnterPlayers) {
      setAllLightsToColor(Color.White);
    }
  });
});

function setAllLightsToColor(color: number) {
  const pixelData = new Uint32Array(NUM_LIGHTS);
  _.times(NUM_LIGHTS, i => {
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
