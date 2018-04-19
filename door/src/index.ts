import rpio = require('rpio');
import Socket = require('socket.io-client');

class DoorListener {
    doorPort: number;
    buttonPort: number;
    label: string;
    old_state: number;

    constructor(doorPort: number, buttonPort: number, label: string) {
        this.doorPort= doorPort;
        this.buttonPort = buttonPort;
        this.label = label;
        this.old_state = 0;
    }

    init () {
        rpio.open(this.buttonPort, rpio.INPUT, rpio.PULL_UP);
        rpio.open(this.doorPort, rpio.OUTPUT, rpio.LOW);

        rpio.poll(this.buttonPort, (pin : number) => {
            rpio.msleep(10);
            var new_state : number = rpio.read(pin);
            if (new_state !== this.old_state) {
                this.old_state = new_state;
                console.log(this.label + "has been pressed, new state %d", new_state);
                if (new_state) {
                    this.openDoor();
                    // @Matt Wait for some time and then call close door?
                    // How do you want to handle this?
                }
            }
        });
    }

    openDoor() {
        rpio.write(this.doorPort, rpio.HIGH);
    }

    closeDoor () {
        rpio.write(this.doorPort, rpio.HIGH);
    }
}

// @ts-ignore
var socket: SocketIOClient.Socket = Socket(process.argv[2]);

// @Matt: The first number should be replaced by the door's
// non-ground port number (see pinout.xyz), the second
// should be the same for the button.
var door = new DoorListener(0,0, 'door');
door.init();

// When the server sends a close-door message, we call close door.
socket.on('close-door', door.closeDoor());
// Same for open.
socket.on('open-door', door.openDoor());