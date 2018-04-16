import Keypad from "./Keypad";
import Socket = require('socket.io-client');
import * as HardwareTypes from "../../shared/HardwareTypes";

export class KeypadListener {
    keypad: Keypad;
    socket: SocketIOClient.Socket;
    sequence: number[];

    sendPacket(packet: any) {
        console.log(packet);
        if (this.sequence.length == 4) {
            this.sequence.shift();
        }
        this.sequence.push(packet.key);
        var state: HardwareTypes.KeypadState = { currentString: this.sequence.join("")};
        this.socket.emit('captains-chair-keypad', state)
        console.log("Currently, the sequence is", this.sequence)
    }
    constructor(socket: SocketIOClient.Socket) {
        console.log("Keypad started.");
        this.sendPacket = this.sendPacket.bind(this);
        this.keypad = new Keypad(this.sendPacket)
        this.socket = socket;
        this.sequence = [];
    }
}
