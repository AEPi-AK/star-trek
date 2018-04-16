import rpio = require('rpio');
import Socket = require('socket.io-client')

import { Color } from '../../shared/HardwareTypes';

console.log("starting");


var color_map : { [t: number]: Color } = {
    [-1]: Color.None,
    0: Color.Red,
    1: Color.Yellow,
    2: Color.Blue
};


class SwitchboardListener {
    inputs : number[];
    outputs : number[];
    label : string;
    listening : boolean;
    current_state : number[];
    timestep : number = 0;

    constructor(inputs : number[], outputs : number[], label : string) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.label = label;
        this.listening = false;
        this.current_state = [];

        for (var inindex = 0; inindex < this.inputs.length; inindex++) {
            this.current_state.push(-1);
        }

    }

    init () {
        for (var port of this.inputs) {
            // console.log("opening port %d", port);
            rpio.open(port, rpio.INPUT, rpio.PULL_DOWN);
            // console.log("state is %d", rpio.read(port));
        }
        for (var port of this.outputs) {
            // console.log("outputting port %d", port);
            rpio.open(port, rpio.OUTPUT);
            rpio.write(port, rpio.LOW);
        }

        for (var inindex = 0; inindex < this.inputs.length; inindex++) {
            this.current_state[inindex] = -1;
        }

        setInterval(() => {
            this.timestep++;
            let written = false;
            for (var inindex = 0; inindex < this.inputs.length; inindex++) {
                this.current_state[inindex] = -1;
            }
            for (var outindex = 0; outindex < this.outputs.length; outindex++) {
                rpio.write(this.outputs[outindex], rpio.HIGH);
                rpio.msleep(5);
                for (var inindex = 0; inindex < this.inputs.length; inindex++) {
                    // console.log('status of pin %d is %d : %d', this.inputs[inindex], rpio.read(this.inputs[inindex]), this.timestep);
                    if (rpio.read(this.inputs[inindex]) == rpio.HIGH) {
                        if (this.current_state[inindex] !== outindex) {
                            this.current_state[inindex] = outindex;
                            written = true;
                        }
                        console.log('found output %d connected to input %d : %d', outindex, inindex, this.timestep);
                        break;
                    }
                }
                rpio.write(this.outputs[outindex], rpio.LOW);
            }

            // if (written) {
                // console.log("emitted");
            console.log(this.current_state, color_map);
            var new_state = { slotTo: color_map[this.current_state[0]], slotTwo: color_map[this.current_state[1]], slotToo: color_map[this.current_state[2]], slot10: color_map[this.current_state[3]] };
            socket.emit('switchboard-update', new_state);
            // }
        }, 100);

        socket.on('switchboard-request', (label : string) => {
            if (label == this.label) {
                socket.emit('switchboard-read', {label : this.label, values : this.current_state});
            }
        });
    }
}

var socket: SocketIOClient.Socket = Socket(process.argv[2]);
let switchboard = new SwitchboardListener([31, 33, 35, 37], [36, 38, 40], "switchboard-1");
switchboard.init();

socket.on('connect', () => {
    socket.emit('identification', 'switchboard-1');
    socket.emit('hi', {});

});



