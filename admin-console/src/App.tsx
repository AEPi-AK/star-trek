import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';

export function emitIdentification(sock: SocketIOClient.Socket, ident: string) {
  sock.emit('identification', ident);
}

export function onConnect(sock: SocketIOClient.Socket, fn: () => void) {
  sock.on('connect', () => fn());
}

export function onDisconnect(sock: SocketIOClient.Socket, fn: () => void) {
  sock.on('disconnect', () => fn());
}

export function onClientsUpdated(sock: SocketIOClient.Socket, fn: (data: string[]) => void) {
  sock.on('clients-updated', (data: string[]) => fn(data));
}

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

const logo = require('./logo.svg');

function subscribeToTimer(cb: (data: string[]) => void, connectCb: (up: boolean) => void) {
  onClientsUpdated(socket, (data: string[]) => cb(data));
  onConnect(socket, () => {
    connectCb(true);
    emitIdentification(socket, 'admin-console');
  });
  onDisconnect(socket, () => connectCb(false));
}

interface AdminConsoleState {
  clients: string[];
  serverUp: boolean;
}

class App extends React.Component<{}, AdminConsoleState> {
  updateClientList (data: string[]) {
    this.setState({clients: data, serverUp: this.state.serverUp});
  }

  setServerUp (up: boolean) {
    this.setState({clients: this.state.clients, serverUp: up});
  }

  constructor(props: {}) {
    super(props);
    this.state = {clients: [], serverUp: false};
    this.updateClientList = this.updateClientList.bind(this);
    this.setServerUp = this.setServerUp.bind(this);

    subscribeToTimer(this.updateClientList, this.setServerUp);
  }

  render() {
    if (this.state.serverUp) {
      var component;
      if (this.state.clients.length) {
        component = <ul>{this.state.clients.map(e => <li key={e}>{e}</li>)}</ul>;
      } else {
        component = <p>There's no clients</p>;
      }
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          {component}
        </div>
      );
    } else {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p>
            The server is down! Fix it!!
          </p>
        </div>
      );
    }
  }
}

export default App;
