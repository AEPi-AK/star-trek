import { HardwareState } from './HardwareTypes';

export type HardwareCheck = (state: HardwareState) => boolean;

export interface GameState {
    tasks: Task[];
    failures: number;
    time: number;
    phase: GamePhase;
    difficulty: GameDifficulty;
    weights: TaskWeights;
    durations: TaskDurations;
    // should be {[d: GameDifficulty]: number}
    task_frequency: {[d: number]: number}; // Number of seconds before attempting to create a new task
    // should be {[d: GameDifficulty]: number}
    max_tasks: {[d: number]: number};
}

export enum FrequencyTaskType {
    PressButton,
    ScanHand,
    FlipSwitches,
    Plugboard,
    ReadCode,
    ScanCard,
    PressBigButton
}

export enum ExclusionTaskType {
    PressWhiteButton,
    PressBlueButton,
    PressYellowButton,
    PressGreenButton,
    ScanHand,
    FlipSwitches,
    Plugboard,
    ReadCode,
    ScanCard,
    PressBigButton
}

export interface TaskWeights {
    // Should be [t: TaskType]: number
    [t: number]: number;
}

export interface TaskDurations {
    // Should be [t: TaskType]: {[d: GameDifficulty]: number}
    [t: number]: {[d: number]: number};
}

export interface TaskTemplate {
    description: string;
    name: string;
    frequencyType: FrequencyTaskType;
    exclusionType: ExclusionTaskType;
    start: (() => void) | null;
    end: (() => void) | null;
    enabled: HardwareCheck;
    completed: HardwareCheck;
}

export interface Task {
    description: string;
    id: number;
    name: string;
    exclusionType: ExclusionTaskType;
    time_created: number;
    time_expires: number;
    start: (() => void) | null;
    end: (() => void) | null;
    enabled: HardwareCheck;
    completed: HardwareCheck;
}

export enum GamePhase {
    NotConnected, // This should only be set in the game-screen module.
    EnterPlayers,
    PlayGame,
    LateGame,
    FiringLaser,
    GameLost,
    GameWon,
}

export enum GameDifficulty {
    PreEasy,
    Easy,
    Medium,
    Hard
}
