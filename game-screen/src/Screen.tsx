import * as React from 'react';
import * as _ from 'lodash';
import * as Socket from 'socket.io-client';
import { GameState, GamePhase, Task } from './shared/GameTypes';

import './fonts/slider.css';
import './fonts/roboto-mono.css';
import './Screen.css';

const socket: SocketIOClient.Socket = Socket(process.env.REACT_APP_MASTER!);

// Press F to pay respects
function formatSeconds(seconds: number) {
  return new Date(0, 0, 0, 0, 0, seconds).toTimeString().substring(4, 8);
}

const defaultGameState: GameState = {
  tasks: [],
  failures: 0,
  time: 0,
  phase: GamePhase.NotConnected,
  weights: {},
  durations: {},
  task_frequency: 0,
  max_tasks: 0,
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

const MAX_HEALTH = 6;

const HealthBar = (props: { remaining: number }) => {
  return (
    <div className="HealthBar">
      {_.range(MAX_HEALTH).map(i => (
        <div
          className={`HealthBar-circle ${
            i >= props.remaining ? 'HealthBar-circle-missing' : ''
          }
          }`}
          key={i}
        />
      ))}
    </div>
  );
};

interface TaskGridProps {
  tasks: Task[];
}

class TaskGrid extends React.Component<TaskGridProps, {}> {
  constructor(props: TaskGridProps) {
    super(props);
  }

  render() {
    console.log(this.props.tasks);
    return (
      <div className="TaskGrid">
        {[1, 2, 3, 4, 5, 6].map(task => (
          <img className="Task" key={2} src={`images/tasks/plug-blue-10.png`} />
        ))}
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
    socket.emit('number-players', 3);
  }

  render() {
    const borderColor = BorderColor.Blue;
    const isStarfieldAnimated = this.state.phase === GamePhase.EnterPlayers;

    return (
      <div className="Screen">
        {/* Above window */}
        <div className="Above-Info">COMPLETE TASKS TO PROTECT SHIP</div>

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
                    <HealthBar remaining={6} />
                  </div>
                  <div className="Below-Info-torpedo">
                    <div className="Below-Info-label">Torpedo Ready In</div>
                    <div className="TorpedoTimer">
                      {formatSeconds(this.state.time)}
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
