import * as React from 'react';
import * as _ from 'lodash';
import * as Socket from 'socket.io-client';
import { HealthBar, TorpedoTimer } from './Widgets';
// @ts-ignore
import { Shake } from 'reshake';
import { Howl } from 'howler';

import { GameState, GamePhase, Task, GameDifficulty } from './shared/GameTypes';

import './fonts/slider.css';
import './fonts/roboto-mono.css';
import './Screen.css';

// Sounds
const SoundNew = new Howl({
  src: ['/sounds/new-task.wav']
});

SoundNew.volume(0.9);

const SoundCorrect = new Howl({
  src: ['/sounds/correct.wav']
});

SoundCorrect.volume(0.8);

const SoundWrong = new Howl({
  src: ['/sounds/incorrect.mp3']
});

const GameMusic = new Howl({
  src: ['/sounds/music.mp3']
});

GameMusic.volume(0.4);

const CompleteTasksInstruction = new Howl({
  src: ['/sounds/complete-tasks-instruction.mp3']
});

CompleteTasksInstruction.volume(0.8);

const EndGameInstruction = new Howl({
  src: ['/sounds/torpedo-fire.mp3']
});

EndGameInstruction.volume(0.8);

const socket: SocketIOClient.Socket = Socket(process.env.REACT_APP_MASTER!);

const defaultGameState: GameState = {
  tasks: [],
  failures: 0,
  time: 0,
  difficulty: GameDifficulty.PreEasy,
  phase: GamePhase.NotConnected,
  weights: {},
  durations: {},
  task_frequency: {
    [GameDifficulty.PreEasy]: 10,
    [GameDifficulty.Easy]: 5,
    [GameDifficulty.Medium]: 4,
    [GameDifficulty.Hard]: 3
  },
  max_tasks: {
    [GameDifficulty.PreEasy]: 2,
    [GameDifficulty.Easy]: 3,
    [GameDifficulty.Medium]: 4,
    [GameDifficulty.Hard]: 5
  }
};

function subscribeToGameState(setTasks: (state: GameState) => void) {
  socket.on('connect', () => {
    socket.emit('identification', 'game-screen');
  });
  socket.on('game-state-updated', (t: GameState) => {
    setTasks(t);
  });
}

enum BorderColor {
  Blue = 'blue',
  Red = 'red',
  Green = 'green'
}

const GRID_SIZE = 6;

const TaskCard = (props: { task: Task; onClick: () => void }) => {
  const totalTime = props.task.time_expires - props.task.time_created;
  const timeElapsed = Date.now() - props.task.time_created;
  const percentTimeRemaining = (totalTime - timeElapsed) / totalTime;
  let color = 'green';
  if (percentTimeRemaining < 0.3) {
    color = 'red';
  } else if (percentTimeRemaining < 0.7) {
    color = 'yellow';
  }

  return (
    <div className="TaskCard" key={props.task.id}>
      <img
        src={`images/tasks/${props.task.name}.png`}
        onClick={props.onClick}
      />
      <div className="TaskCard-progressBar">
        <div className="TaskCard-progress TaskCard-progress-background">
          <div
            className={`TaskCard-progress TaskCard-progress-${color}`}
            style={{ width: `${percentTimeRemaining * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const GameVideo = (props: { name: 'Lose' | 'Win' | 'Intro' }) => {
  return (
    <div className="VideoContainer">
      <video className="Video" width="1460" height="750" autoPlay={true}>
        <source src={`/videos/${props.name}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
};

interface TaskGridProps {
  tasks: Task[];
  completeTask: (id: number) => void;
}

interface TaskGridState {
  slots: Array<Task | null>;
  updateTimer: number;
}

class TaskGrid extends React.Component<TaskGridProps, TaskGridState> {
  constructor(props: TaskGridProps) {
    super(props);
    this.state = {
      slots: Array(GRID_SIZE),
      updateTimer: 0
    };
  }

  componentDidMount() {
    const updateTimer = setInterval(this.forceUpdate.bind(this), 50);
    this.setState({ updateTimer });
  }

  componentWillUnmount() {
    clearInterval(this.state.updateTimer);
  }

  updateSlotsWithTasks(newTasks: Task[]) {
    const getRandomAvailableSlotIndex = (): number | null => {
      const openIndicies = this.state.slots
        // map filled slots to null, open slots to an index
        .map((slot, i) => (slot ? null : i))
        // remove null slots
        .filter((index: number | null) => index !== null);
      return openIndicies.length > 0 ? _.sample(openIndicies)! : null;
    };

    const slots = _.cloneDeep(this.state.slots);

    // Add newly-added tasks
    newTasks.forEach(task => {
      if (_.some(slots, t => t && t.id === task.id)) {
        return;
      }
      const indexForTask = getRandomAvailableSlotIndex();
      if (indexForTask === null) {
        console.log('THIS SHOULD NOT HAPPEN! PRESS F AND BUG JORDAN OR AVI');
        return;
      }
      slots[indexForTask] = task;
      SoundNew.play();
    });

    // Remove newly-removed tasks
    slots.forEach((task, i) => {
      if (!task) {
        return;
      }

      if (_.some(newTasks, t => t.id === task.id)) {
        return;
      }

      const taskFailed = task.time_expires < Date.now();
      if (taskFailed) {
        SoundWrong.play();
      } else {
        SoundCorrect.play();
      }

      slots[i] = null;
    });

    this.setState({ slots });
  }

  componentWillReceiveProps(nextProps: TaskGridProps) {
    this.updateSlotsWithTasks(nextProps.tasks);
  }

  render() {
    return (
      <div className="TaskGrid">
        {this.state.slots.map((task: Task | null, index) => {
          if (task) {
            return (
              <TaskCard
                task={task}
                onClick={() => this.props.completeTask(task.id)}
              />
            );
          } else {
            return (
              <img
                className="TaskCard"
                key={index}
                src={`images/tasks/blank.png`}
              />
            );
          }
        })}
      </div>
    );
  }
}

class Shakeable extends React.Component<{ isShaking: boolean }, {}> {
  render() {
    if (!this.props.isShaking) {
      return this.props.children;
    }
    return (
      <Shake
        h={5}
        v={5}
        r={3}
        dur={300}
        int={10}
        max={100}
        fixed={true}
        fixedStop={false}
        freez={true}
      >
        {this.props.children}
      </Shake>
    );
  }
}

class Screen extends React.Component<{}, GameState> {
  completeTasksInstructionPlayed: boolean;
  endGameInstructionPlayed: boolean;
  setGameState(gamestate: GameState) {
    this.setState(gamestate);
  }

  constructor(props: {}) {
    super(props);
    this.state = defaultGameState;
    this.setGameState = this.setGameState.bind(this);

    subscribeToGameState(this.setGameState);

    this.addPlayers = this.addPlayers.bind(this);
    this.completeTask = this.completeTask.bind(this);
    this.advanceScreen = this.advanceScreen.bind(this);
    this.completeTasksInstructionPlayed = false;
    (window as any).addPlayers = this.addPlayers;
  }

  componentDidMount() {
    window.addEventListener('keydown', () => this.advanceScreen());
  }

  addPlayers() {
    socket.emit('number-players', 5);
  }

  completeTask(id: number) {
    socket.emit('task-completed', id);
  }

  advanceScreen() {
    console.log('advancing phase');
    socket.emit('switch-phase');
  }

  render() {
    const borderColor = BorderColor.Blue;
    const isStarfieldAnimated = this.state.phase === GamePhase.EnterPlayers;
    return (
      <Shakeable isShaking={false}>
        <div className="Screen">
          {/* Above window */}
          <div className="Above-Info">
            {(() => {
              if (this.state.phase === GamePhase.EnterPlayers) {
                this.completeTasksInstructionPlayed = false;
                this.endGameInstructionPlayed = false;
                return 'WELCOME ABOARD THE U.S.S. ENTERPRISE';
              } else if (this.state.phase === GamePhase.PlayGame) {
                if (
                  !CompleteTasksInstruction.playing() &&
                  !this.completeTasksInstructionPlayed
                ) {
                  this.completeTasksInstructionPlayed = true;
                  CompleteTasksInstruction.play();
                }
                return 'COMPLETE TASKS TO PROTECT SHIP';
                // return `Difficulty: ${this.state.difficulty}`;
              } else if (this.state.phase === GamePhase.LateGame) {
                if (GameMusic.playing()) {
                  GameMusic.pause();
                }
                if (
                  !EndGameInstruction.playing() &&
                  !this.endGameInstructionPlayed
                ) {
                  this.endGameInstructionPlayed = true;
                  EndGameInstruction.play();
                }
                return ' ';
              } else if (this.state.phase === GamePhase.FiringLaser) {
                GameMusic.pause();
                return ' ';
              } else if (
                this.state.phase === GamePhase.IntroVideo ||
                this.state.phase === GamePhase.GameLost ||
                this.state.phase === GamePhase.GameWon
              ) {
                return 'INCOMING TRANSMISSION';
              } else {
                return ' ';
              }
            })()}
          </div>

          {/* Window */}
          <div
            className={`Window Window-border Window-border-${borderColor}
             ${isStarfieldAnimated ? 'Window-animated' : ''}`}
          >
            {(() => {
              if (this.state.phase === GamePhase.EnterPlayers) {
                if (!GameMusic.playing()) {
                  GameMusic.play();
                }
                return (
                  <div className="StartInstructions">
                    <img src="/images/start.png" onClick={this.addPlayers} />
                  </div>
                );
              } else if (this.state.phase === GamePhase.NotConnected) {
                return 'NOT CONNECTED';
              } else if (this.state.phase === GamePhase.LateGame) {
                return <img className="EndGameImg" src="/images/endgame.png" />;
              } else if (this.state.phase === GamePhase.IntroVideo) {
                if (GameMusic.playing()) {
                  GameMusic.pause();
                }
                return <GameVideo name={'Intro'} />;
              } else if (this.state.phase === GamePhase.GameLost) {
                return <GameVideo name={'Lose'} />;
              } else if (this.state.phase === GamePhase.GameWon) {
                if (EndGameInstruction.playing()) {
                  EndGameInstruction.pause();
                }
                return <GameVideo name={'Win'} />;
              } else if (this.state.phase === GamePhase.PlayGame) {
                if (!GameMusic.playing()) {
                  GameMusic.play();
                }
                return (
                  <TaskGrid
                    completeTask={this.completeTask}
                    tasks={this.state.tasks}
                  />
                );
              } else {
                return null;
              }
            })()}
          </div>

          {/* Below window */}
          <div className="Below-Info">
            {(() => {
              if (this.state.phase === GamePhase.EnterPlayers) {
                return null;
                // } else if (
                //   this.state.phase === GamePhase.IntroVideo ||
                //   this.state.phase === GamePhase.GameLost ||
                //   this.state.phase === GamePhase.GameWon
                // ) {
                //   return (
                //     <div className="Below-Info-big">INCOMING TRANSMISSION</div>
                //   );
              } else if (this.state.phase === GamePhase.LateGame) {
                return <div className="Below-Info-big">TORPEDO READY</div>;
              } else if (this.state.phase === GamePhase.PlayGame) {
                return (
                  <div className="Below-Info-PlayGame">
                    <div className="Below-Info-ship-health">
                      <div className="Below-Info-label">Ship Health</div>
                      <HealthBar failures={this.state.failures} />
                    </div>
                    <div className="Below-Info-torpedo">
                      <div className="Below-Info-label">Torpedo Ready In</div>
                      <div className="Below-Info-timer">
                        <TorpedoTimer time={this.state.time} />
                      </div>
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })()}
          </div>
        </div>
      </Shakeable>
    );
  }
}

export default Screen;
