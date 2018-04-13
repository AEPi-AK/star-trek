export interface HardwareState {
    switch0: SwitchState;
    switch1: SwitchState;
    switch2: SwitchState;
    switch3: SwitchState;
    smallButtonWhite0: ButtonState;
    smallButtonWhite1: ButtonState;
    smallButtonRed0: ButtonState;
    smallButtonRed1: ButtonState;
    smallButtonBlue0: ButtonState;
    smallButtonBlue1: ButtonState;
    smallButtonYellow0: ButtonState;
    smallButtonYellow1: ButtonState;
    smallButtonGreen0: ButtonState;
    smallButtonGreen1: ButtonState;
    mediumButtonWhite: ButtonState;
    mediumButtonRed: ButtonState;
    mediumButtonBlue: ButtonState;
    mediumButtonYellow: ButtonState;
    mediumButtonGreen: ButtonState;
    bigButtonRed: ButtonState;
    rfidScanner: RFIDScannerState;
    plugboard: PlugboardState;
    captainsChair: CaptainsChairState;
    keypad: KeypadState;
    touchSensor: TouchSensorState;
    enabledMapping: {
      switch0: boolean;
      switch1: boolean;
      switch2: boolean;
      switch3: boolean;
      smallButtonWhite0: boolean;
      smallButtonWhite1: boolean;
      smallButtonRed0 : boolean;
      smallButtonRed1 : boolean;
      smallButtonBlue0: boolean;
      smallButtonBlue1: boolean;
      smallButtonYellow0: boolean;
      smallButtonYellow1: boolean;
      smallButtonGreen0: boolean;
      smallButtonGreen1: boolean;
      mediumButtonWhite: boolean;
      mediumButtonRed : boolean;
      mediumButtonBlue: boolean;
      mediumButtonYello: boolean;
      mediumButtonGreen: boolean;
      bigButtonRed: boolean;
      rfidScanner: boolean;
      plugboard: boolean;
      captainsChair: boolean;
      keypad: boolean;
      touchSens: boolean;
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
    slot0: Color;
    slot1: Color;
    slot2: Color;
    slot3: Color;
}

export interface CaptainsChairState {
}

export interface KeypadState {
}

export interface TouchSensorState {
}