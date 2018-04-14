import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';
import * as GameTypes from '../../shared/GameTypes';
// @ts-ignore
import { Line } from 'rc-progress';

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

var defaultGameState: GameTypes.GameState = {
  tasks: [{description: 'test', id: 0, time_created: 0, time_expires: 0}],
  failures: 0,
  time: 0,
};

// const logo = require('./logo.svg');

function subscribeToGameState(setTasks: (state: GameTypes.GameState) => void) {
  socket.on('connect', () => {
    socket.emit('identification', 'countdown');
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

  render() {
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
    return (
      <div className="App">
        <ul>{tasks}</ul>
        <p>{'Strikes: ' + this.state.failures}</p>
        <Line percent={Math.max(0, (this.state.time / 200) * 100)} strokeWidth="1" strokeColor="#008000" />
        <p>{'Time remaining: ' + Math.max(0, this.state.time)}</p>
      </div>
    );
  }
}

export default App;
