import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';
import * as GameTypes from './shared/GameTypes';
// @ts-ignore
import { Line } from 'rc-progress';

// @ts-ignore
var socket: SocketIOClient.Socket = Socket(process.env.REACT_APP_MASTER);

var defaultGameState: GameTypes.GameState = {
  tasks: [],
  failures: 0,
  time: 0,
  phase: GameTypes.GamePhase.NotConnected,
  weights: {},
  durations: {},
  task_frequency: 0,
  max_tasks: 0,
};

// const logo = require('./logo.svg');

function subscribeToGameState(setTasks: (state: GameTypes.GameState) => void) {
  socket.on('connect', () => {
    socket.emit('identification', 'game-screen');
  });
  socket.on('game-state-updated', (t: GameTypes.GameState) => {
    setTasks(t);
  });
}

class App extends React.Component<{}, GameTypes.GameState> {
  setGameState(gamestate: GameTypes.GameState) {
    this.setState(gamestate);
  }
  constructor(props: {}) {
    super(props);
    this.state = defaultGameState;
    this.setGameState = this.setGameState.bind(this);

    subscribeToGameState(this.setGameState);
  }

  completeTask(id: number) {
    socket.emit('task-completed', id);
  }

  addPlayers(players: number) {
    socket.emit('number-players', players);
  }

  resetGame() {
    socket.emit('reset-game');
  }

  incrementProbability(x: GameTypes.FrequencyTaskType) {
    socket.emit('increment-probability', x);
  }

  decrementProbability(x: GameTypes.FrequencyTaskType) {
    socket.emit('decrement-probability', x);
  }

  incrementDuration(x: GameTypes.FrequencyTaskType) {
    socket.emit('increment-duration', x);
  }

  decrementDuration(x: GameTypes.FrequencyTaskType) {
    socket.emit('decrement-duration', x);
  }

  incrementFrequency() {
    socket.emit('increment-frequency');
  }

  decrementFrequency() {
    socket.emit('decrement-frequency');
  }

  incrementMaxTasks() {
    socket.emit('increment-max-tasks');
  }

  decrementMaxTasks() {
    socket.emit('decrement-max-tasks');
  }

  render() {
    var probabilityControls = (
      <div>
        Probability Controls and Duration Controls:
        <div>
          {'Press Button: ' +
            this.state.weights[GameTypes.FrequencyTaskType.PressButton]}
          <button
            onClick={e =>
              this.incrementProbability(GameTypes.FrequencyTaskType.PressButton)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementProbability(GameTypes.FrequencyTaskType.PressButton)
            }
          >
            -
          </button>
          {'Duration: ' + this.state.durations[GameTypes.FrequencyTaskType.PressButton]}
          <button
            onClick={e =>
              this.incrementDuration(GameTypes.FrequencyTaskType.PressButton)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementDuration(GameTypes.FrequencyTaskType.PressButton)
            }
          >
            -
          </button>
        </div>
        <div>
          {'Scan Hand: ' + this.state.weights[GameTypes.FrequencyTaskType.ScanHand]}
          <button
            onClick={e =>
              this.incrementProbability(GameTypes.FrequencyTaskType.ScanHand)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementProbability(GameTypes.FrequencyTaskType.ScanHand)
            }
          >
            -
          </button>
          {'Duration: ' + this.state.durations[GameTypes.FrequencyTaskType.ScanHand]}
          <button
            onClick={e => this.incrementDuration(GameTypes.FrequencyTaskType.ScanHand)}
          >
            +
          </button>
          <button
            onClick={e => this.decrementDuration(GameTypes.FrequencyTaskType.ScanHand)}
          >
            -
          </button>
        </div>
        <div>
          {'Flip Switches: ' +
            this.state.weights[GameTypes.FrequencyTaskType.FlipSwitches]}
          <button
            onClick={e =>
              this.incrementProbability(GameTypes.FrequencyTaskType.FlipSwitches)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementProbability(GameTypes.FrequencyTaskType.FlipSwitches)
            }
          >
            -
          </button>
          {'Duration: ' + this.state.durations[GameTypes.FrequencyTaskType.FlipSwitches]}
          <button
            onClick={e =>
              this.incrementDuration(GameTypes.FrequencyTaskType.FlipSwitches)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementDuration(GameTypes.FrequencyTaskType.FlipSwitches)
            }
          >
            -
          </button>
        </div>
        <div>
          {'Plugboard: ' + this.state.weights[GameTypes.FrequencyTaskType.Plugboard]}
          <button
            onClick={e =>
              this.incrementProbability(GameTypes.FrequencyTaskType.Plugboard)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementProbability(GameTypes.FrequencyTaskType.Plugboard)
            }
          >
            -
          </button>
          {'Duration: ' + this.state.durations[GameTypes.FrequencyTaskType.Plugboard]}
          <button
            onClick={e => this.incrementDuration(GameTypes.FrequencyTaskType.Plugboard)}
          >
            +
          </button>
          <button
            onClick={e => this.decrementDuration(GameTypes.FrequencyTaskType.Plugboard)}
          >
            -
          </button>
        </div>
        <div>
          {'Read Code: ' + this.state.weights[GameTypes.FrequencyTaskType.ReadCode]}
          <button
            onClick={e =>
              this.incrementProbability(GameTypes.FrequencyTaskType.ReadCode)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementProbability(GameTypes.FrequencyTaskType.ReadCode)
            }
          >
            -
          </button>
          {'Duration: ' + this.state.durations[GameTypes.FrequencyTaskType.ReadCode]}
          <button
            onClick={e => this.incrementDuration(GameTypes.FrequencyTaskType.ReadCode)}
          >
            +
          </button>
          <button
            onClick={e => this.decrementDuration(GameTypes.FrequencyTaskType.ReadCode)}
          >
            -
          </button>
        </div>
        <div>
          {'Scan Card: ' + this.state.weights[GameTypes.FrequencyTaskType.ScanCard]}
          <button
            onClick={e =>
              this.incrementProbability(GameTypes.FrequencyTaskType.ScanCard)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementProbability(GameTypes.FrequencyTaskType.ScanCard)
            }
          >
            -
          </button>
          {'Duration: ' + this.state.durations[GameTypes.FrequencyTaskType.ScanCard]}
          <button
            onClick={e => this.incrementDuration(GameTypes.FrequencyTaskType.ScanCard)}
          >
            +
          </button>
          <button
            onClick={e => this.decrementDuration(GameTypes.FrequencyTaskType.ScanCard)}
          >
            -
          </button>
        </div>
        <div>
          {'Press Big Red Button: ' +
            this.state.weights[GameTypes.FrequencyTaskType.PressBigButton]}
          <button
            onClick={e =>
              this.incrementProbability(GameTypes.FrequencyTaskType.PressBigButton)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementProbability(GameTypes.FrequencyTaskType.PressBigButton)
            }
          >
            -
          </button>
          {'Duration: ' +
            this.state.durations[GameTypes.FrequencyTaskType.PressBigButton]}
          <button
            onClick={e =>
              this.incrementDuration(GameTypes.FrequencyTaskType.PressBigButton)
            }
          >
            +
          </button>
          <button
            onClick={e =>
              this.decrementDuration(GameTypes.FrequencyTaskType.PressBigButton)
            }
          >
            -
          </button>
        </div>
      </div>
    );

    var tasks = this.state.tasks.map(task => {
      var now = new Date().getTime();
      return (
        <li key={task.id}>
          <button
            className="Task"
            onClick={event => this.completeTask(task.id)}
          >
            {task.description +
              ': ' +
              Math.max(
                0,
                Math.floor((task.time_expires - now) / 1000),
              ).toString()}
          </button>
        </li>
      );
    });
    if (this.state.phase === GameTypes.GamePhase.NotConnected) {
      return <div>Not connected to master-server</div>;
    } else if (this.state.phase === GameTypes.GamePhase.EnterPlayers) {
      return (
        <div>
          <div>
            Enter Players:
            <button onClick={event => this.addPlayers(1)}>1</button>
            <button onClick={event => this.addPlayers(2)}>2</button>
            <button onClick={event => this.addPlayers(3)}>3</button>
            <button onClick={event => this.addPlayers(4)}>4</button>
            <button onClick={event => this.addPlayers(5)}>5</button>
            <button onClick={event => this.addPlayers(6)}>6</button>
            <button onClick={event => this.addPlayers(7)}>7</button>
            <button onClick={event => this.addPlayers(8)}>8</button>
            <button onClick={event => this.addPlayers(9)}>9</button>
            <button onClick={event => this.addPlayers(10)}>10</button>
          </div>
          <div>
            {'Time between tasks: ' + this.state.task_frequency}
            <button onClick={e => this.incrementFrequency()}>+</button>
            <button onClick={e => this.decrementFrequency()}>-</button>
            <div>
              {'Max Tasks: ' + this.state.max_tasks}
              <button onClick={e => this.incrementMaxTasks()}>+</button>
              <button onClick={e => this.decrementMaxTasks()}>-</button>
            </div>
            {probabilityControls}
          </div>
        </div>
      );
    }
    return (
      <div className="App">
        <div className="RoundInfo">{'Strikes: ' + this.state.failures}</div>
        <div id="tasks">
          <ul>{tasks}</ul>
        </div>
        <div className="LineLabel">Time Remaining</div>
        <Line
          percent={Math.max(0, this.state.time / 150 * 100)}
          strokeWidth="3"
          strokeColor="#008000"
        />
        <p>{'Time remaining: ' + Math.max(0, this.state.time)}</p>
        <button onClick={this.resetGame}>Reset Game</button>
        <div>
          {'Time between tasks: ' + this.state.task_frequency}
          <button onClick={e => this.incrementFrequency()}>+</button>
          <button onClick={e => this.decrementFrequency()}>-</button>
        </div>
        <div>
          {'Max Tasks: ' + this.state.max_tasks}
          <button onClick={e => this.incrementMaxTasks()}>+</button>
          <button onClick={e => this.decrementMaxTasks()}>-</button>
        </div>
        {probabilityControls}
      </div>
    );
  }
}

export default App;
