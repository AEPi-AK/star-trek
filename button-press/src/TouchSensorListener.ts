import rpio = require('rpio');
import Socket = require('socket.io-client');

export class TouchSensorListener {
    port: number;
    label: string;
    old_state: number;
    socket: SocketIOClient.Socket;
    lastOff: Date;

    constructor(port: number, label: string, socket: SocketIOClient.Socket) {
        this.port = port;
        this.label = label;
        this.old_state = 0;
        this.socket = socket;
        this.lastOff = new Date();
    }

    init () {
        rpio.open(this.port, rpio.INPUT, rpio.PULL_UP);
        this.old_state = rpio.read(this.port);

        rpio.poll(this.port, (pin : number) => {
            rpio.msleep(10);
            var new_state : number = rpio.read(pin);
            if (new_state !== this.old_state) {
                this.old_state = new_state;
                console.log(this.label + "has been pressed, new state %d", new_state);
                var state = {
                    label: this.label,
                    lit: false,
                    pressed: this.old_state ? false : true,
                };
                if (new_state == 0) {
                    let now = new Date();
                    if (now.getSeconds() - this.lastOff.getSeconds() >= 1000) {
                        this.socket.emit('button-pressed', state);
                    }
                    this.lastOff = now;
                }
            }
        });
    }
}