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
        touchpad: ButtonState;
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
        stationA_redSwitch: boolean;
        stationA_blueButton: boolean; 
        stationA_greenButton: boolean; 
        stationA_yellowButton: boolean;
        stationA_keypad: boolean;
        stationB_greenSwitch: boolean;
        stationB_whiteButton: boolean; 
        stationB_blueButton: boolean; 
        stationB_yellowButton: boolean;
        stationB_plugboard: boolean;
        stationC_blueSwitch: boolean;
        stationC_yellowButton: boolean;
        stationC_whiteButton: boolean;
        stationC_greenButton: boolean;
        stationC_touchpad: boolean;
        stationD_yellowSwitch: boolean;
        stationD_greenButton: boolean;
        stationD_whiteButton: boolean;
        stationD_blueButton: boolean;
        stationD_rfidScanner: boolean;
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
    cardID: string;
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
    currentString: string;
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
        keypad: { currentString: ''}
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
        touchpad: createButton('stationC-touchpad')
    },
    stationD: {
        yellowSwitch: createButton('stationD-yellow-switch'),
        greenButton: createButton('stationD-green-button'),
        whiteButton: createButton('stationD-white-button'),
        blueButton: createButton('stationD-blue-button'),
        rfidScanner: {cardID: '' }
    },
    bigRedButton: createButton('big-red-button'),
    enabled: {
        stationA_redSwitch: true,
        stationA_blueButton: true, 
        stationA_greenButton: true,
        stationA_yellowButton: true,
        stationA_keypad: true,
        stationB_greenSwitch: true,
        stationB_whiteButton: true,
        stationB_blueButton: true, 
        stationB_yellowButton: true,
        stationB_plugboard: true,
        stationC_blueSwitch: true,
        stationC_yellowButton: true,
        stationC_whiteButton: true,
        stationC_greenButton: true,
        stationC_touchpad: true,
        stationD_yellowSwitch: true,
        stationD_greenButton: true,
        stationD_whiteButton: true,
        stationD_blueButton: true,
        stationD_rfidScanner: true,
        bigRedButton: true
    }
});