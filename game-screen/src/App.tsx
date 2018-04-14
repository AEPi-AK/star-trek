import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';
import * as GameTypes from './shared/GameTypes';
// @ts-ignore
import { Line } from 'rc-progress';

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

var defaultGameState: GameTypes.GameState = {
  tasks: [{description: 'test', id: 0, time_created: 0, time_expires: 0}],
  failures: 0,
  time: 0,
  phase: GameTypes.GamePhase.NotConnected,
  weights: {}, 
  durations: {},
  task_frequency: 0,
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

  incrementProbability(x: GameTypes.TaskType) {
    socket.emit('increment-probability', x);
  }

  decrementProbability(x: GameTypes.TaskType) {
    socket.emit('decrement-probability', x);
  }

  incrementDuration(x: GameTypes.TaskType) {
    socket.emit('increment-duration', x);
  }

  decrementDuration(x: GameTypes.TaskType) {
    socket.emit('decrement-duration', x);
  }

  incrementFrequency() {
    socket.emit('increment-frequency');
  }

  decrementFrequency() {
    socket.emit('decrement-frequency');
  }

  render() {

    var probabilityControls = (
      <div>
        Probability Controls and Duration Controls:
        <div>
          {'Press Button: ' + this.state.weights[GameTypes.TaskType.PressButton]}
          <button onClick={e => this.incrementProbability(GameTypes.TaskType.PressButton)}>+</button>
          <button onClick={e => this.decrementProbability(GameTypes.TaskType.PressButton)}>-</button>
          {'Duration: ' + this.state.durations[GameTypes.TaskType.PressButton]}
          <button onClick={e => this.incrementDuration(GameTypes.TaskType.PressButton)}>+</button>
          <button onClick={e => this.decrementDuration(GameTypes.TaskType.PressButton)}>-</button>
        </div>
        <div>
          {'Scan Hand: ' + this.state.weights[GameTypes.TaskType.ScanHand]}
          <button onClick={e => this.incrementProbability(GameTypes.TaskType.ScanHand)}>+</button>
          <button onClick={e => this.decrementProbability(GameTypes.TaskType.ScanHand)}>-</button>
          {'Duration: ' + this.state.durations[GameTypes.TaskType.ScanHand]}
          <button onClick={e => this.incrementDuration(GameTypes.TaskType.ScanHand)}>+</button>
          <button onClick={e => this.decrementDuration(GameTypes.TaskType.ScanHand)}>-</button>
        </div>
        <div>
          {'Flip Switches: ' + this.state.weights[GameTypes.TaskType.FlipSwitches]}
          <button onClick={e => this.incrementProbability(GameTypes.TaskType.FlipSwitches)}>+</button>
          <button onClick={e => this.decrementProbability(GameTypes.TaskType.FlipSwitches)}>-</button>
          {'Duration: ' + this.state.durations[GameTypes.TaskType.FlipSwitches]}
          <button onClick={e => this.incrementDuration(GameTypes.TaskType.FlipSwitches)}>+</button>
          <button onClick={e => this.decrementDuration(GameTypes.TaskType.FlipSwitches)}>-</button>
        </div>
        <div>
          {'Plugboard: ' + this.state.weights[GameTypes.TaskType.Plugboard]}
          <button onClick={e => this.incrementProbability(GameTypes.TaskType.Plugboard)}>+</button>
          <button onClick={e => this.decrementProbability(GameTypes.TaskType.Plugboard)}>-</button>
          {'Duration: ' + this.state.durations[GameTypes.TaskType.Plugboard]}
          <button onClick={e => this.incrementDuration(GameTypes.TaskType.Plugboard)}>+</button>
          <button onClick={e => this.decrementDuration(GameTypes.TaskType.Plugboard)}>-</button>
        </div>
        <div>
          {'Read Code: ' + this.state.weights[GameTypes.TaskType.ReadCode]}
          <button onClick={e => this.incrementProbability(GameTypes.TaskType.ReadCode)}>+</button>
          <button onClick={e => this.decrementProbability(GameTypes.TaskType.ReadCode)}>-</button>
          {'Duration: ' + this.state.durations[GameTypes.TaskType.ReadCode]}
          <button onClick={e => this.incrementDuration(GameTypes.TaskType.ReadCode)}>+</button>
          <button onClick={e => this.decrementDuration(GameTypes.TaskType.ReadCode)}>-</button>
        </div>
        <div>
          {'Scan Card: ' + this.state.weights[GameTypes.TaskType.ScanCard]}
          <button onClick={e => this.incrementProbability(GameTypes.TaskType.ScanCard)}>+</button>
          <button onClick={e => this.decrementProbability(GameTypes.TaskType.ScanCard)}>-</button>
          {'Duration: ' + this.state.durations[GameTypes.TaskType.ScanCard]}
          <button onClick={e => this.incrementDuration(GameTypes.TaskType.ScanCard)}>+</button>
          <button onClick={e => this.decrementDuration(GameTypes.TaskType.ScanCard)}>-</button>
        </div>
        <div>
          {'Press Big Red Button: ' + this.state.weights[GameTypes.TaskType.PressBigButton]}
          <button onClick={e => this.incrementProbability(GameTypes.TaskType.PressBigButton)}>+</button>
          <button onClick={e => this.decrementProbability(GameTypes.TaskType.PressBigButton)}>-</button>
          {'Duration: ' + this.state.durations[GameTypes.TaskType.PressBigButton]}
          <button onClick={e => this.incrementDuration(GameTypes.TaskType.PressBigButton)}>+</button>
          <button onClick={e => this.decrementDuration(GameTypes.TaskType.PressBigButton)}>-</button>
        </div>
      </div>
    );

    var tasks = this.state.tasks.map((task) => {
      var now = (new Date()).getTime();
      return (
        <li key={task.id}>
          <button onClick={event => this.completeTask(task.id)}>
            {task.description + ': ' + 
            (Math.max(0, Math.floor((task.time_expires - now) / 1000))).toString()}
          </button>
        </li>
      );
    });
    if (this.state.phase === GameTypes.GamePhase.NotConnected) {
      return (
        <div>
          Not connected to master-server
        </div>
      );
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
            {probabilityControls}
          </div>
        </div>
      );
    }
    return (
      <div className="App">
        <div id="tasks">
          <ul>{tasks}</ul>
        </div>
        <div white-space="pre">
          <pre>
            {'Strikes: ' + this.state.failures + '     ' +
              'Time between tasks: ' + this.state.task_frequency}
          </pre>
          <button onClick={e => this.incrementFrequency()}>+</button>
          <button onClick={e => this.decrementFrequency()}>-</button>
        </div>
        <Line percent={Math.max(0, (this.state.time / 150) * 100)} strokeWidth="3" strokeColor="#008000" />
        <p>{'Time remaining: ' + Math.max(0, this.state.time)}</p>
        <button onClick={this.resetGame}>Reset Game</button>
        {probabilityControls}
      </div>
    );
  }
}

export default App;
