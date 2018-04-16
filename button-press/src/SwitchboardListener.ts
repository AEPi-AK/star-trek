import rpio = require('rpio');
import Socket = require('socket.io-client')

import { Color } from '../../shared/HardwareTypes';


var color_map : { [t: number]: Color } = {
    [-1]: Color.None,
    0: Color.Red,
    1: Color.Yellow,
    2: Color.Blue
};


export class SwitchboardListener {
    inputs : number[];
    outputs : number[];
    label : string;
    listening : boolean;
    current_state : number[];
    timestep : number = 0;
    socket: SocketIOClient.Socket;

    constructor(inputs : number[], outputs : number[], label : string, socket: SocketIOClient.Socket) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.label = label;
        this.listening = false;
        this.current_state = [];
        this.socket = socket;

        for (var inindex = 0; inindex < this.inputs.length; inindex++) {
            this.current_state.push(-1);
        }

    }

    init () {
        console.log("Switchboard started.");
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
            this.socket.emit('switchboard-update', new_state);
            // }
        }, 100);

        this.socket.on('switchboard-request', (label : string) => {
            if (label == this.label) {
                this.socket.emit('switchboard-read', {label : this.label, values : this.current_state});
            }
        });
    }
}




