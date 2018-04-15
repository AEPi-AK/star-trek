import rpio = require('rpio');
import Socket = require('socket.io-client')

console.log("starting station");


class PullUpListener {
    port: number;
    label: string;
    old_state: number;

    constructor(port: number, label: string) {
        this.port = port;
        this.label = label;
        this.old_state = 0;
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
                socket.emit('button-pressed', state);
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
    let redSwitch = new PullUpListener(5, "stationA-red-switch");
    redSwitch.init();
    let blueButton = new PullUpListener(10, "stationA-blue-button");
    blueButton.init();
    let greenButton = new PullUpListener(13, "stationA-green-button");
    greenButton.init();
    let yellowButton = new PullUpListener(19, "stationA-yellow-button");
    yellowButton.init();
}
// @ts-ignore
else if (process.argv[3] === 'stationB') {
    let blueSwitch = new PullUpListener(5, "stationC-blue-switch");
    blueSwitch.init();
    let whiteButton = new PullUpListener(10, "stationB-white-button");
    whiteButton.init();
    let blueButton = new PullUpListener(13, "stationB-blue-button");
    blueButton.init();
    let yellowButton = new PullUpListener(19, "stationB-yellow-button");
    yellowButton.init();
}
else if (process.argv[3] === 'stationC') {
    let greenSwitch = new PullUpListener(5, "stationC-green-switch");
    greenSwitch.init();
    let yellowButton = new PullUpListener(10, "stationC-yellow-button");
    yellowButton.init();
    let whiteButton = new PullUpListener(13, "stationC-white-button");
    whiteButton.init();
    let greenButton = new PullUpListener(19, "stationC-green-button");
    greenButton.init();
}
// @ts-ignore
else if (process.argv[3] === 'stationD') {
    let yellowSwitch = new PullUpListener(5, "stationD-yellow-switch");
    yellowSwitch.init();
    let greenButton = new PullUpListener(10, "stationD-green-button");
    greenButton.init();
    let whiteButton = new PullUpListener(13, "stationD-white-button");
    whiteButton.init();
    let blueButton = new PullUpListener(19, "stationD-blue-button");
    blueButton.init();
}

socket.on('connect', () => {
    // @ts-ignore
    socket.emit('identification', process.argv[3]);
});
