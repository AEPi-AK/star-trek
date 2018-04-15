import rpio = require('rpio');
import Socket = require('socket.io-client')

console.log("starting");


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
            for (var outindex = 0; outindex < this.outputs.length; outindex++) {
                rpio.write(this.outputs[outindex], rpio.HIGH);
                rpio.msleep(5);
                for (var inindex = 0; inindex < this.inputs.length; inindex++) {
                    // console.log('status of pin %d is %d : %d', this.inputs[inindex], rpio.read(this.inputs[inindex]), this.timestep);
                    if (rpio.read(this.inputs[inindex]) == rpio.HIGH) {
                        this.current_state[inindex] = outindex;
                        // console.log('found output %d connected to input %d : %d', outindex, inindex, this.timestep);
                        break;
                    }
                }
                rpio.write(this.outputs[outindex], rpio.LOW);
            }
        }, 50);

        socket.on('switchboard-request', (label : string) => {
            if (label == this.label) {
                socket.emit('switchboard-read', {label : this.label, values : this.current_state});
            }
        });
    }
}

var socket: SocketIOClient.Socket = Socket(process.argv[2]);


let switchboard = new SwitchboardListener([8, 10], [11, 13, 15], "switchboard-1");
switchboard.init();

socket.on('connect', () => {
    socket.emit('identification', 'switchboard-1');
});

