import StrictEventEmitter, { StrictBroadcast } from 'strict-event-emitter-types';
import * as HardwareTypes from './HardwareTypes';

interface ServerEvents {
  disconnect: void,
  identification: string,
  "button-pressed": HardwareTypes.ButtonState,
  players: number,
  "rfid-match": boolean,
}

interface ClientEvents {
  disconnect: void,
  "button-listen": string,
  connect: void,
  players: void,
  rfid: string,
}

export type ServerSocket = StrictEventEmitter<SocketIO.Socket, ServerEvents, ClientEvents>;
export type ClientSocket = StrictEventEmitter<SocketIOClient.Socket, ClientEvents, ServerEvents>;
export type ClientBroadcast = StrictBroadcast<ClientSocket>;