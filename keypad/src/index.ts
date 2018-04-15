import Keypad from "./Keypad";
import * from "socket.io-client";
import * from "../../shared/HardwareTypes";

console.log("Keypad started.");




class KeypadListener {
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
        this.keypad = new Keypad(this.sendPacket)
        this.socket = socket;
        this.sequence = [];
    }
}