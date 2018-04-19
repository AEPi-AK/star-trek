import * as React from 'react';
import './App.css';
import './bootstrap.min.css';
import * as Socket from 'socket.io-client';
import * as HardwareTypes from './shared/HardwareTypes';

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

// const logo = require('./logo.svg');

var connectedClients: string[] = [];

var button: HardwareTypes.ButtonState = {lit: false, label: 'test', pressed: false};
button.lit = true;

function subscribeToTimer(cb: (data: string[]) => void, connectCb: (up: boolean) => void, 
                          setHS: (hardwareState: HardwareTypes.HardwareState) => void) {
  socket.on('clients-updated', cb);
  socket.on('connect', () => {
    connectCb(true);
    socket.emit('identification', 'admin-console');
  });
  socket.on('update-hardware-state', setHS);
  socket.on('disconnect', () => connectCb(false));
}

function toggleHardware() {
  // @ts-ignore
  var info: {name: string, enabled: boolean, updateHS: (name: string, enabled: boolean) => void} = this;
  
  socket.emit('toggle-hardware', {name: info.name, enabled: !info.enabled});
  info.updateHS(info.name, !info.enabled);
}

interface AdminConsoleState {
  clients: string[];
  serverUp: boolean;
  hardware: HardwareTypes.HardwareState;
}

class App extends React.Component<{}, AdminConsoleState> {
  updateClientList (data: string[]) {
    for (var client of data) {
      if (connectedClients.indexOf(client) === -1) {
        connectedClients.push(client);
      }
    }
    this.setState({clients: data, serverUp: this.state.serverUp, hardware: this.state.hardware});
  }

  setServerUp (up: boolean) {
    this.setState({clients: this.state.clients, serverUp: up, hardware: this.state.hardware});
  }

  setHardwareState (hardwareState: HardwareTypes.HardwareState) {
    this.setState({clients: this.state.clients, serverUp: this.state.serverUp, hardware: hardwareState});
  }

  updateHardwareState (name: string, enabled: boolean) {
    var hardwareState = this.state.hardware;
    hardwareState.enabled[name] = enabled;
    this.setState({clients: this.state.clients, serverUp: this.state.serverUp, hardware: hardwareState});
  }

  constructor(props: {}) {
    super(props);
    this.state = {clients: [], serverUp: false, hardware: HardwareTypes.DEFAULT_HARDWARE_STATE()};
    this.updateClientList = this.updateClientList.bind(this);
    this.setServerUp = this.setServerUp.bind(this);
    this.setHardwareState = this.setHardwareState.bind(this);

    subscribeToTimer(this.updateClientList, this.setServerUp, this.setHardwareState);
  }

  render() {
    if (this.state.serverUp) {
      var clientComponent;
      if (connectedClients.length) {
        clientComponent = (
          <table className="table">
            <tbody>
              {
                connectedClients.map(e => {
                  if (this.state.clients.indexOf(e) !== -1) {
                    return <tr className="client-on" key={e}><td>{e}</td></tr>;
                  } else {
                    return <tr className="client-off" key={e}><td>{e}</td></tr>;
                  }
                })
              }
            </tbody>
          </table>
        );
      } else {
        clientComponent = <p>There's no clients</p>;
      }
      var stateComponent = (
      <table className="table">
        <tbody>
          {Object.keys(this.state.hardware.enabled).map((e: string) => {
              var enabled: boolean = this.state.hardware.enabled[e];
              var info = {name: e, enabled: enabled, updateHS: this.updateHardwareState.bind(this)};
              var onCheckboxChange = toggleHardware.bind(info);
              return (
              <tr className="state" key={e}>
                <td>
                  <input type="checkbox" name={e + '-checkbox'} defaultChecked={enabled} onChange={onCheckboxChange} />
                    {e}
                  </td>
              </tr>
              );
            }
          )}
        </tbody>
      </table>
      );
      return (
        <div className="App">
          {/* <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header> */}
          {clientComponent}
          {stateComponent}
        </div>
      );
    } else {
      return (
        <div className="App">
          {/* <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header> */}
          <p>
            The server is down! Fix it!!
          </p>
        </div>
      );
    }
  }
}

export default App;
