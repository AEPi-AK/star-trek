import Socket = require('socket.io-client');
import * as HardwareTypes from "../../shared/HardwareTypes";
import Scanner from "./Scanner";

export class ScannerListener {
    scanner: Scanner;
    socket: SocketIOClient.Socket;

    sendPacket(packet: any) {
        console.log(packet);
        
        var state: HardwareTypes.RFIDScannerState = { cardID: String(packet.cardID)};
        this.socket.emit('captains-chair-scanner', state)
        console.log("Detected an ID with code", packet.cardID)
    }
    constructor(socket: SocketIOClient.Socket) {
    console.log("Scanner started.");
        this.sendPacket = this.sendPacket.bind(this);
        this.scanner = new Scanner(this.sendPacket)
        this.socket = socket;
    }
}
