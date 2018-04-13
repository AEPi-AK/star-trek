import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

// const logo = require('./logo.svg');

function subscribeToTimer(setCode: (code: string) => void) {
  socket.on('connect', () => {
    socket.emit('identification', 'captains-chair');
  });
  socket.on('update-captains-chair', (c: string) => {
    setCode(c);
  });
}

interface CaptainsChairState {
  code: string;
}

class App extends React.Component<{}, CaptainsChairState> {

  setCode (c: string) {
    this.setState({code: c});
  }

  constructor(props: {}) {
    super(props);
    this.state = {code: ''};
    this.setCode = this.setCode.bind(this);

    subscribeToTimer(this.setCode);
  }

  render() {
    return (
      <div className="App">
        <p id="timer">{this.state.code}</p>
      </div>
    );
  }
}

export default App;
