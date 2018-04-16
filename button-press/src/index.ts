import rpio = require('rpio');
import Socket = require('socket.io-client')
//@ts-ignore
import { KeypadListener } from './KeypadListener'; 
import { ScannerListener } from './ScannerListener';
import { SwitchboardListener } from './SwitchboardListener';

console.log("starting station");


class PullUpListener {
    port: number;
    label: string;
    old_state: number;
    flashing: boolean;
    currentInterval: number;
    lightPort?: number;

    constructor(port: number, label: string, lightPort?: number) {
        this.port = port;
        this.label = label;
        this.old_state = 0;
        this.flashing = false;
        this.currentInterval = 0;
        this.lightPort = lightPort;
    }

    init () {
        rpio.open(this.port, rpio.INPUT, rpio.PULL_UP);
        if (this.lightPort) {
            rpio.open(this.lightPort, rpio.OUTPUT, rpio.LOW);
        }
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

    flash() {
        console.log("flashing");
        if (!this.flashing) {
            this.flashing = true;
            var lit = false;
            // @ts-ignore
            this.currentInterval = setInterval(() => {
                if (lit) {
                    lit = false;
                    if (this.lightPort)  {
                        rpio.write(this.lightPort, rpio.LOW);
                    }
                } else {
                    lit = true;
                    if (this.lightPort) {
                        rpio.write(this.lightPort, rpio.HIGH);
                    }
                }
            }, 500);
        }
    }
    stopFlash () {
        if (this.flashing) {
            this.flashing = false;
            clearInterval(this.currentInterval);
        }
    }
}

// @ts-ignore
var socket: SocketIOClient.Socket = Socket(process.argv[2]);

// @ts-ignore
if (process.argv[3] === 'stationA') {
    let redSwitch = new PullUpListener(5, "stationA-red-switch");
    redSwitch.init();
    let blueButton = new PullUpListener(10, "stationA-blue-button", 26);
    blueButton.init();
    let greenButton = new PullUpListener(13, "stationA-green-button", 40);
    greenButton.init();
    let yellowButton = new PullUpListener(19, "stationA-yellow-button", 33);
    yellowButton.init();

    var keypad = new KeypadListener(socket);

    socket.on('button-flash', (label: string) => {
        if (label === 'stationA-blue-button') {
            blueButton.flash();
        } else if (label === 'stationA-green-button') {
            greenButton.flash();
        } else if (label === 'stationA-yellow-button') {
            yellowButton.flash();
        }
    });
    socket.on('button-stop-flash', (label: string) => {
        if (label === 'stationA-blue-button') {
            blueButton.stopFlash();
        } else if (label === 'stationA-green-button') {
            greenButton.stopFlash();
        } else if (label === 'stationA-yellow-button') {
            yellowButton.stopFlash();
        }
    });
}
// @ts-ignore
else if (process.argv[3] === 'stationB') {
    let blueSwitch = new PullUpListener(5, "stationB-blue-switch");
    blueSwitch.init();
    let whiteButton = new PullUpListener(10, "stationB-white-button", 26);
    whiteButton.init();
    let blueButton = new PullUpListener(13, "stationB-blue-button", 29);
    blueButton.init();
    let yellowButton = new PullUpListener(19, "stationB-yellow-button", 32);
    yellowButton.init();
    let switchboard = new SwitchboardListener([31, 33, 35, 37], [36, 38, 40], "switchboard-1", socket);
    switchboard.init();
    socket.on('button-flash', (label: string) => {
        if (label === 'stationB-white-button') {
            whiteButton.flash();
        } else if (label === 'stationB-blue-button') {
            blueButton.flash();
        } else if (label === 'stationB-yellow-button') {
            yellowButton.flash();
        }
    });
    socket.on('button-stop-flash', (label: string) => {
        if (label === 'stationB-white-button') {
            whiteButton.stopFlash();
        } else if (label === 'stationB-blue-button') {
            blueButton.stopFlash();
        } else if (label === 'stationB-yellow-button') {
            yellowButton.stopFlash();
        }
    });
}
// @ts-ignore
else if (process.argv[3] === 'stationC') {
    let greenSwitch = new PullUpListener(5, "stationC-green-switch");
    greenSwitch.init();
    let yellowButton = new PullUpListener(10, "stationC-yellow-button", 26);
    yellowButton.init();
    let whiteButton = new PullUpListener(13, "stationC-white-button", 29);
    whiteButton.init();
    let greenButton = new PullUpListener(19, "stationC-green-button", 33);
    greenButton.init();
    let touchpad = new PullUpListener(36, "stationC-touchpad");
    touchpad.init();

    socket.on('button-flash', (label: string) => {
        if (label === 'stationC-yellow-button') {
            yellowButton.flash();
        } else if (label === 'stationC-white-button') {
            whiteButton.flash();
        } else if (label === 'stationC-green-button') {
            greenButton.flash();
        }
    });

    socket.on('button-stop-flash', (label: string) => {
        if (label === 'stationC-yellow-button') {
            yellowButton.stopFlash();
        } else if (label === 'stationC-white-button') {
            whiteButton.stopFlash();
        } else if (label === 'stationC-green-button') {
            greenButton.stopFlash();
        }
    });
}
// @ts-ignore
else if (process.argv[3] === 'stationD') {
    let yellowSwitch = new PullUpListener(5, "stationD-yellow-switch");
    yellowSwitch.init();
    let greenButton = new PullUpListener(10, "stationD-green-button", 26);
    greenButton.init();
    let whiteButton = new PullUpListener(13, "stationD-white-button", 29);
    whiteButton.init();
    let blueButton = new PullUpListener(19, "stationD-blue-button", 33);
    blueButton.init();

    var scanner = new ScannerListener(socket);

    socket.on('button-flash', (label: string) => {
        if (label === 'stationD-green-button') {
            greenButton.flash();
        } else if (label === 'stationD-white-button') {
            whiteButton.flash();
        } else if (label === 'stationD-blue-button') {
            blueButton.flash();
        }
    });
    socket.on('button-stop-flash', (label: string) => {
        if (label === 'stationD-green-button') {
            greenButton.stopFlash();
        } else if (label === 'stationD-white-button') {
            whiteButton.stopFlash();
        } else if (label === 'stationD-blue-button') {
            blueButton.stopFlash();
        }
    });
}
else if (process.argv[3] === 'captains-chair') {
    console.log('starting captains chair');
    let redButton = new PullUpListener(5, "big-red-button", 10);
    redButton.init();

    socket.on('button-flash', (label: string) => {
        if (label === 'big-red-button') {
            redButton.flash();
        }
    });
    socket.on('button-stop-flash', (label: string) => {
        if (label === 'big-red-button') {
            redButton.stopFlash();
        }
    });
}

socket.on('connect', () => {
    // @ts-ignore
    socket.emit('identification', process.argv[3]);
});
