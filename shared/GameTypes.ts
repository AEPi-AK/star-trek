export interface GameState {
    tasks: Task[];
    failures: number;
    time: number;
    phase: GamePhase;
}

export interface TaskTemplate {
    description: string;
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