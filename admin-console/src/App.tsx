import * as React from 'react';
import './App.css';
import * as Socket from 'socket.io-client';
import * as HardwareTypes from '../../shared/HardwareTypes';

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

const logo = require('./logo.svg');

const stateList = ['switch0', 'switch1', 'switch2', 'switch3', 'smallButtonWhite0', 'smallButtonWhite1', 
'smallButtonRed0', 'smallButtonRed1', 'smallButtonBlue0', 'smallButtonBlue1', 'smallButtonYellow0', 
'smallButtonYellow1', 'smallButtonGreen0', 'smallButtonGreen1', 'mediumButtonWhite', 'mediumButtonRed', 
'mediumButtonBlue', 'mediumButtonYellow', 'mediumButtonGreen', 'bigButtonRed', 'rfidScanner', 'plugboard', 
'captainsChair', 'keypad', 'touchSensor'];

var connectedClients: string[] = [];

var button: HardwareTypes.ButtonState = {lit: false, label: 'test', pressed: false};
button.lit = true;

function subscribeToTimer(cb: (data: string[]) => void, connectCb: (up: boolean) => void) {
  socket.on('clients-updated', cb);
  socket.on('connect', () => {
    connectCb(true);
    socket.emit('identification', 'admin-console');
  });
  socket.on('disconnect', () => connectCb(false));
}

interface AdminConsoleState {
  clients: string[];
  serverUp: boolean;
}

class App extends React.Component<{}, AdminConsoleState> {
  updateClientList (data: string[]) {
    for (var client of data) {
      if (connectedClients.indexOf(client) === -1) {
        connectedClients.push(client);
      }
    }
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
      var clientComponent;
      if (connectedClients.length) {
        clientComponent = (
          <ul>
            {
              connectedClients.map(e => {
                if (this.state.clients.indexOf(e) !== -1) {
                  return <li className="client-on" key={e}>{e}</li>;
                } else {
                  return <li className="client-off" key={e}>{e}</li>;
                }
              })
            }
          </ul>
        );
      } else {
        clientComponent = <p>There's no clients</p>;
      }
      var stateComponent = (
      <ul>
        {stateList.map(e => <li className="state" key={e}><input type="checkbox" name={e + '-checkbox'} />{e}</li>)}
      </ul>
      );
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          {clientComponent}
          {stateComponent}
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
