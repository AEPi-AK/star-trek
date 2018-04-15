import rpio = require('rpio');
import Socket = require('socket.io-client')

console.log("starting");


class ButtonListener {
    port : number;
    label : string;
    old_state : number;
    listening : boolean;

    constructor(port : number, label : string) {
        this.port = port;
        this.label = label;
        this.old_state = 0;
        this.listening = false;
    }

    init () {
        rpio.open(this.port, rpio.INPUT, rpio.PULL_DOWN);
        this.old_state = rpio.read(this.port);

        rpio.poll(this.port, (pin : number) => {
            rpio.msleep(10);
            var new_state : number = rpio.read(pin);
            if (new_state !== this.old_state) {
                this.old_state = new_state;
                console.log("button has been pressed, new state %d", new_state);
                socket.emit('button-pressed',
                    {label : this.label, pressed: this.old_state ? false : true, lit : false});
            }
        });

        socket.on('request-state',(label : string) =>{
          if (label === this.label) {
          socket.emit('state-response', this.old_state)
        }
        });
    }
}

// @ts-ignore
var socket: SocketIOClient.Socket = Socket(process.argv[2]);


let button = new ButtonListener(3, "button3");
button.init();

socket.on('connect', () => {
    socket.emit('identification', 'button-1');
});
