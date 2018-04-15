import rpio = require('rpio');
import Socket = require('socket.io-client')

console.log("starting station");


class PullUpListener {
    port: number;
    label: string;
    old_state: number;
    channel: string;
    propName: string;

    constructor(port: number, label: string, channel: string, propName: string) {
        this.port = port;
        this.label = label;
        this.old_state = 0;
	this.channel = channel;
	this.propName = propName;
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
		  lit: false
		};
		// @ts-ignore
		state[this.propName] = this.old_state ? false : true;
                socket.emit(this.channel, state);
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


let orangeSwitch = new PullUpListener(5, "station1-orange-switch", 'switch-pressed', 'up');
orangeSwitch.init();
let greenButton = new PullUpListener(10, "station1-green-button", 'button-pressed', 'pressed');
greenButton.init();
let whiteButton = new PullUpListener(13, "station1-white-button", 'button-pressed', 'pressed');
whiteButton.init();
let blueButton = new PullUpListener(19, "station1-blue-button", 'button-pressed', 'pressed');
blueButton.init();

socket.on('connect', () => {
    socket.emit('identification', 'stationA');
});
