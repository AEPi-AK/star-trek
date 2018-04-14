export interface GameState {
    tasks: Task[];
    failures: number;
    time: number;
    phase: GamePhase;
}

export enum TaskType {
    PressButton,
    ScanHand,
    FlipSwitches,
    Plugboard,
    ReadCode,
    ScanCard,
    PressBigButton
}

export interface TaskTemplate {
    description: string;
    type: TaskType;
    // completed : HardwareState;
}

export interface Task {
    description: string;
    id: number;
    time_created: number;
    time_expires: number;
}

export enum GamePhase {
    EnterPlayers,
    PlayGame,
}