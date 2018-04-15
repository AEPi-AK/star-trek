// export interface HardwareState {
//     switch0: SwitchState;
//     switch1: SwitchState;
//     switch2: SwitchState;
//     switch3: SwitchState;
//     smallButtonWhite0: ButtonState;
//     smallButtonWhite1: ButtonState;
//     smallButtonRed0: ButtonState;
//     smallButtonRed1: ButtonState;
//     smallButtonBlue0: ButtonState;
//     smallButtonBlue1: ButtonState;
//     smallButtonYellow0: ButtonState;
//     smallButtonYellow1: ButtonState;
//     smallButtonGreen0: ButtonState;
//     smallButtonGreen1: ButtonState;
//     mediumButtonWhite: ButtonState;
//     mediumButtonRed: ButtonState;
//     mediumButtonBlue: ButtonState;
//     mediumButtonYellow: ButtonState;
//     mediumButtonGreen: ButtonState;
//     bigButtonRed: ButtonState;
//     rfidScanner: RFIDScannerState;
//     plugboard: PlugboardState;
//     captainsChair: CaptainsChairState;
//     keypad: KeypadState;
//     touchSensor: TouchSensorState;
//     enabledMapping: {
//       switch0: boolean;
//       switch1: boolean;
//       switch2: boolean;
//       switch3: boolean;
//       smallButtonWhite0: boolean;
//       smallButtonWhite1: boolean;
//       smallButtonRed0: boolean;
//       smallButtonRed1: boolean;
//       smallButtonBlue0: boolean;
//       smallButtonBlue1: boolean;
//       smallButtonYellow0: boolean;
//       smallButtonYellow1: boolean;
//       smallButtonGreen0: boolean;
//       smallButtonGreen1: boolean;
//       mediumButtonWhite: boolean;
//       mediumButtonRed: boolean;
//       mediumButtonBlue: boolean;
//       mediumButtonYellow: boolean;
//       mediumButtonGreen: boolean;
//       bigButtonRed: boolean;
//       rfidScanner: boolean;
//       plugboard: boolean;
//       captainsChair: boolean;
//       keypad: boolean;
//       touchSensor: boolean;
//     };
// }

export interface HardwareState {
    stationA: {
        redSwitch: ButtonState;
        blueButton: ButtonState; 
        greenButton: ButtonState; 
        yellowButton: ButtonState;
        keypad: KeypadState;
    };
    stationB: {
        greenSwitch: ButtonState;
        whiteButton: ButtonState; 
        blueButton: ButtonState; 
        yellowButton: ButtonState;
        plugboard: PlugboardState;
    };
    stationC: {
        blueSwitch: ButtonState;
        yellowButton: ButtonState;
        whiteButton: ButtonState;
        greenButton: ButtonState;
        touchpad: TouchSensorState;
    };
    stationD: {
        yellowSwitch: ButtonState;
        greenButton: ButtonState;
        whiteButton: ButtonState;
        blueButton: ButtonState;
        rfidScanner: RFIDScannerState;
    };
    bigRedButton: ButtonState;
    enabled: {
        stationA: {
            redSwitch: boolean;
            blueButton: boolean; 
            greenButton: boolean; 
            yellowButton: boolean;
            keypad: boolean;
        };
        stationB: {
            greenSwitch: boolean;
            whiteButton: boolean; 
            blueButton: boolean; 
            yellowButton: boolean;
            plugboard: boolean;
        };
        stationC: {
            blueSwitch: boolean;
            yellowButton: boolean;
            whiteButton: boolean;
            greenButton: boolean;
            touchpad: boolean;
        };
        stationD: {
            yellowSwitch: boolean;
            greenButton: boolean;
            whiteButton: boolean;
            blueButton: boolean;
            rfidScanner: boolean;
        };
        bigRedButton: boolean;
    };
}

export interface ButtonState {
    pressed: boolean;
    label: string;
    lit: boolean;
}

export interface SwitchState {
    up: boolean;
    label: string;
    lit: boolean;
}

export interface RFIDScannerState {
}

export enum Color {
    Red,
    White,
    Green,
    Blue,
    Yellow,
    None,
}

export interface PlugboardState {
    slotTo: Color;
    slotToo: Color;
    slotTwo: Color;
    slot10: Color;
}

export interface CaptainsChairState {
}

export interface KeypadState {
    correct: boolean;
}

export interface TouchSensorState {
    pressedThreeSeconds: boolean;
}

var createButton = (s: string) => ({pressed: false, label: s, lit: false});
export var DEFAULT_HARDWARE_STATE: () => HardwareState = () => ({
    stationA: {
        redSwitch: createButton('stationA-red-switch'),
        blueButton: createButton('stationA-blue-button'),
        greenButton: createButton('stationA-green-button'),
        yellowButton: createButton('stationA-yellow-button'),
        keypad: { correct: false }
    },
    stationB: {
        greenSwitch: createButton('stationB-green-switch'),
        whiteButton: createButton('stationB-white-button'),
        blueButton: createButton('stationB-blue-button'),
        yellowButton: createButton('stationB-yellow-button'),
        plugboard: { slotTo: Color.None, slotToo: Color.None, slotTwo: Color.None, slot10: Color.None }
    },
    stationC: {
        blueSwitch: createButton('stationC-blue-switch'),
        yellowButton: createButton('stationC-yellow-button'),
        whiteButton: createButton('stationC-white-button'),
        greenButton: createButton('stationC-green-button'),
        touchpad: { pressedThreeSeconds: false }
    },
    stationD: {
        yellowSwitch: createButton('stationD-yellow-switch'),
        greenButton: createButton('stationD-green-button'),
        whiteButton: createButton('stationD-white-button'),
        blueButton: createButton('stationD-blue-button'),
        rfidScanner: { }
    },
    bigRedButton: createButton('big-red-button'),
    enabled: {
        stationA: {
            redSwitch: true,
            blueButton: true,
            greenButton: true,
            yellowButton: true,
            keypad: true
        },
        stationB: {
            greenSwitch: true,
            whiteButton: true,
            blueButton: true,
            yellowButton: true,
            plugboard: true
        },
        stationC: {
            blueSwitch: true,
            yellowButton: true,
            whiteButton: true,
            greenButton: true,
            touchpad: true
        },
        stationD: {
            yellowSwitch: true,
            greenButton: true,
            whiteButton: true,
            blueButton: true,
            rfidScanner: true
        },
        bigRedButton: true
    }
});