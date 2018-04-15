import { HardwareState } from './HardwareTypes';

export type HardwareCheck = (state: HardwareState) => boolean;

export interface GameState {
    tasks: Task[];
    failures: number;
    time: number;
    phase: GamePhase;
    weights: TaskWeights;
    durations: TaskDurations;
    task_frequency: number; // Number of seconds before attempting to create a new task
    max_tasks: number;
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

export interface TaskWeights {
    // Should be [t: TaskType]: number
    [t: number]: number;
}

export interface TaskDurations {
    // Should be [t: TaskType]: number
    [t: number]: number;
}

export interface TaskTemplate {
    description: string;
    type: TaskType;
    start: (() => void) | null;
    enabled: HardwareCheck;
    completed: HardwareCheck;
    // completed : HardwareState;
}

export interface Task {
    description: string;
    id: number;
    time_created: number;
    time_expires: number;
    start: (() => void) | null;
    enabled: HardwareCheck;
    completed: HardwareCheck;
}

export enum GamePhase {
    NotConnected, // This should only be set in the game-screen module.
    EnterPlayers,
    PlayGame,
}