"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var Color;
(function (Color) {
    Color[Color["Red"] = 0] = "Red";
    Color[Color["White"] = 1] = "White";
    Color[Color["Green"] = 2] = "Green";
    Color[Color["Blue"] = 3] = "Blue";
    Color[Color["Yellow"] = 4] = "Yellow";
    Color[Color["None"] = 5] = "None";
})(Color = exports.Color || (exports.Color = {}));
var createButton = function (s) { return ({ pressed: false, label: s, lit: false }); };
exports.DEFAULT_HARDWARE_STATE = function () { return ({
    stationA: {
        redSwitch: createButton('stationA-red-switch'),
        blueButton: createButton('stationA-blue-button'),
        greenButton: createButton('stationA-green-button'),
        yellowButton: createButton('stationA-yellow-button'),
        keypad: { currentString: '' }
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
        rfidScanner: { cardID: '' }
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
            blueSwitch: false,
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
}); };
//# sourceMappingURL=HardwareTypes.js.map