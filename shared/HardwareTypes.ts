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
    navigation: {
        greenSwitch: SwitchState;
        whiteButton: ButtonState;
        redButton: ButtonState
    };
    operations: {
        plugboard: PlugboardState;
        keypad: KeypadState;
        yellowSwitch: SwitchState;
        whiteButton: ButtonState;
        redButton: ButtonState;
    };
    security: {
        touchpad: TouchSensorState;
        rfidScanner: RFIDScannerState;
        blueSwitch: SwitchState;
    };
    tactical: {
        yellowButton: ButtonState;
        blueButton: ButtonState;
        greenButton: ButtonState;
        bigRedButton: ButtonState;
        redSwitch: SwitchState;
        whiteButton: ButtonState;
        redButton: ButtonState;
    };
    enabled: {
        navigation: {
            greenSwitch: boolean;
            whiteButton: boolean;
            redButton: boolean
        };
        operations: {
            plugboard: boolean;
            keypad: boolean;
            yellowSwitch: boolean;
            whiteButton: boolean;
            redButton: boolean;
        };
        security: {
            touchpad: boolean;
            rfidScanner: boolean;
            blueSwitch: boolean;
        };
        tactical: {
            yellowButton: boolean;
            blueButton: boolean;
            greenButton: boolean;
            bigRedButton: boolean;
            redSwitch: boolean;
            whiteButton: boolean;
            redButton: boolean;
        }
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
var createSwitch = (s: string) => ({up: false, label: s, lit: false});
export var DEFAULT_HARDWARE_STATE = () => ({
    navigation: {
        greenSwitch: createSwitch('navigation-green-switch'),
        whiteButton: createButton('navigation-white-button'),
        redButton: createButton('navigation-red-button')
    },
    operations: {
        plugboard: {slotTo: Color.None, slotToo: Color.None, slotTwo: Color.None, slot10: Color.None},
        keypad: {correct: false},
        yellowSwitch: createSwitch('operations-yellow-switch'),
        whiteButton: createButton('operations-white-button'),
        redButton: createButton('operations-red-button')
    },
    security: {
        touchpad: {pressedThreeSeconds: false},
        rfidScanner: {},
        blueSwitch: createSwitch('security-blue-switch')
    },
    tactical: {
        yellowButton: createButton('tactical-yellow-button'),
        blueButton: createButton('tactical-blue-button'),
        greenButton: createButton('tactical-green-button'),
        bigRedButton: createButton('tactical-big-button'),
        redSwitch: createSwitch('tactical-red-switch'),
        whiteButton: createButton('tactical-white-button'),
        redButton: createButton('tactical-red-button')
    },
    enabled: {
        navigation: {
            greenSwitch: true,
            whiteButton: true,
            redButton: true,
        },
        operations: {
            plugboard: true,
            keypad: true,
            yellowSwitch: true,
            whiteButton: true,
            redButton: true,
        },
        security: {
            touchpad: true,
            rfidScanner: true,
            blueSwitch: true,
        },
        tactical: {
            yellowButton: true,
            blueButton: true,
            greenButton: true,
            bigRedButton: true,
            redSwitch: true,
            whiteButton: true,
            redButton: true,
        }
    }
});