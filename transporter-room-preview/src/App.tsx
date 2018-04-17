import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';

var socket = Socket('http://localhost:5000');

class App extends React.Component<{}, {}> {

  constructor(props: {}) {
    super(props);
  }

  capture() {
    socket.emit('capture');
  }

  render() {
    return (
      <div>
        <object
            type="text/html"
            data="http://localhost:5000/video_feed"
        />
      <button onClick={e => this.capture()}>
        capture
      </button>
      </div>
    );
  }
}

export default App;
