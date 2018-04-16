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

        let on_count = 0;
        setInterval(() => {
            if (rpio.read(this.port) === rpio.HIGH) {
                on_count++;
                if (on_count === 10) {
                    console.log('touchpad pressed');
                    this.socket.emit('button-pressed', {label: this.label, lit: false, pressed: true});
                }
            } else {
                if (on_count >= 10) {
                    console.log('touchpad unpressed');
                    this.socket.emit('button-pressed', {label: this.label, lit: false, pressed: false})
                }
                on_count = 0;
            }
        }, 100);
        // rpio.poll(this.port, (pin : number) => {
        //     rpio.msleep(10);
        //     var new_state : number = rpio.read(pin);
        //     this.old_state = new_state;
        //     let now = new Date();
        //     if (now.getSeconds() - this.lastOff.getSeconds() >= 1 && new_state === 1) {
        //         console.log(this.label + "has been pressed, new state %d", new_state);
        //         this.socket.emit('button-pressed', state);
        //     }
        //     if (new_state === 0) {
        //         this.lastOff = now;
        //     }

        // });
    }
}