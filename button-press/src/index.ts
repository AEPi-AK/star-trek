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

// @ts-ignore
if (process.argv[3] === 'stationA') {
    let redSwitch = new PullUpListener(5, "stationA-red-switch", 'switch-pressed', 'up');
    redSwitch.init();
    let blueButton = new PullUpListener(10, "stationA-blue-button", 'button-pressed', 'pressed');
    blueButton.init();
    let greenButton = new PullUpListener(13, "stationA-green-button", 'button-pressed', 'pressed');
    greenButton.init();
    let yellowButton = new PullUpListener(19, "stationA-yellow-button", 'button-pressed', 'pressed');
    yellowButton.init();
}
// @ts-ignore
else if (process.argv[3] === 'stationB') {
    let greenSwitch = new PullUpListener(5, "stationB-green-switch", 'switch-pressed', 'up');
    greenSwitch.init();
    let whiteButton = new PullUpListener(10, "stationB-white-button", 'button-pressed', 'pressed');
    whiteButton.init();
    let blueButton = new PullUpListener(13, "stationB-blue-button", 'button-pressed', 'pressed');
    blueButton.init();
    let yellowButton = new PullUpListener(19, "stationB-yellow-button", 'button-pressed', 'pressed');
    yellowButton.init();
}
// @ts-ignore
else if (process.argv[3] === 'stationD') {
    let orangeSwitch = new PullUpListener(5, "stationD-orange-switch", 'switch-pressed', 'up');
    orangeSwitch.init();
    let greenButton = new PullUpListener(10, "stationD-green-button", 'button-pressed', 'pressed');
    greenButton.init();
    let whiteButton = new PullUpListener(13, "stationD-white-button", 'button-pressed', 'pressed');
    whiteButton.init();
    let blueButton = new PullUpListener(19, "stationD-blue-button", 'button-pressed', 'pressed');
    blueButton.init();
}

socket.on('connect', () => {
    // @ts-ignore
    socket.emit('identification', process.argv[3]);
});
