import * as React from 'react';
import * as _ from 'lodash';
import * as Socket from 'socket.io-client';
import { HealthBar, TorpedoTimer } from './Widgets';
import { GameState, GamePhase, Task, GameDifficulty } from './shared/GameTypes';

import './fonts/slider.css';
import './fonts/roboto-mono.css';
import './Screen.css';

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
    [GameDifficulty.Hard]: 3,
  },
  max_tasks: {
    [GameDifficulty.PreEasy]: 2,
    [GameDifficulty.Easy]: 3,
    [GameDifficulty.Medium]: 4,
    [GameDifficulty.Hard]: 5,
  },
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
  Green = 'green',
}

const GRID_SIZE = 6;

const TaskCard = (props: { task: Task }) => {
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
      <img src={`images/tasks/${props.task.name}.png`} />
      <div className="TaskCard-progress TaskCard-progress-background" />
      <div
        className={`TaskCard-progress TaskCard-progress-${color}`}
        style={{ width: `${percentTimeRemaining * 100}%` }}
      />
    </div>
  );
};

interface TaskGridProps {
  tasks: Task[];
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
      updateTimer: 0,
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
    });

    // Remove newly-removed tasks
    slots.forEach((task, i) => {
      if (!task) {
        return;
      }

      if (_.some(newTasks, t => t.id === task.id)) {
        return;
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
            return <TaskCard task={task} />;
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

class Screen extends React.Component<{}, GameState> {
  setGameState(gamestate: GameState) {
    this.setState(gamestate);
  }

  constructor(props: {}) {
    super(props);
    this.state = defaultGameState;
    this.setGameState = this.setGameState.bind(this);

    subscribeToGameState(this.setGameState);

    this.addPlayers = this.addPlayers.bind(this);
  }

  addPlayers() {
    socket.emit('number-players', 5);
  }

  render() {
    const borderColor = BorderColor.Blue;
    const isStarfieldAnimated = this.state.phase === GamePhase.EnterPlayers;

    return (
      <div className="Screen">
        {/* Above window */}
        <div className="Above-Info">
          {(() => {
            if (this.state.phase === GamePhase.EnterPlayers) {
              return 'WELCOME ABOARD THE U.S.S. ENTERPRISE';
            } else if (this.state.phase === GamePhase.PlayGame) {
              return 'COMPLETE TASKS TO PROTECT SHIP';
            } else {
              return null;
            }
          })()}
        </div>

        {/* Window */}
        <div
          className={`Window Window-border-${borderColor} ${
            isStarfieldAnimated ? 'Window-animated' : ''
          }`}
        >
          {(() => {
            if (this.state.phase === GamePhase.EnterPlayers) {
              return (
                <div className="StartInstructions">
                  <img src="/images/start.png" onClick={this.addPlayers} />
                </div>
              );
            } else if (this.state.phase === GamePhase.NotConnected) {
              return 'NOT CONNECTED';
            } else if (this.state.phase === GamePhase.PlayGame) {
              return <TaskGrid tasks={this.state.tasks} />;
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
    );
  }
}

export default Screen;
