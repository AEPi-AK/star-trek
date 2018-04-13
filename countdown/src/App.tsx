import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

// const logo = require('./logo.svg');

function subscribeToTimer(setTime: (time: number) => void) {
  socket.on('connect', () => {
    socket.emit('identification', 'countdown');
  });
  socket.on('update-countdown', (t: number) => {
    setTime(t);
  });
}

interface CountdownState {
  time: number;
}

class App extends React.Component<{}, CountdownState> {

  setTime (t: number) {
    this.setState({time: t});
  }

  constructor(props: {}) {
    super(props);
    this.state = {time: 120};
    this.setTime = this.setTime.bind(this);

    subscribeToTimer(this.setTime);
  }

  render() {
    var min = Math.floor(this.state.time / 60);
    var sec = this.state.time - (60 * min);
    var secStr = '' + sec;
    if (sec < 10) {
      secStr = '0' + secStr;
    }
    return (
      <div className="App">
        <p id="timer">{`${min}:${secStr}`}</p>
      </div>
    );
  }
}

export default App;
