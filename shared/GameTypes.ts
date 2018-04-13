export interface GameState {
    tasks : Task[];
    failures : number;
    time : number;
}

export interface TaskTemplate {
    description : string;
    // completed : HardwareState;
}

export interface Task {
    description : string;
    id : number;
    time_created : Date;
    time_expires : Date;
}