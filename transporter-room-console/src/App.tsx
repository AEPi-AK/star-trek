import * as React from 'react';
import './App.css';
import './bootstrap.min.css';
import * as Socket from 'socket.io-client';
import * as HardwareTypes from './HardwareTypes';

var socket: SocketIOClient.Socket = Socket('http://localhost:3000');

// const logo = require('./logo.svg');

const stateList = ['switch0', 'switch1', 'switch2', 'switch3', 'smallButtonWhite0', 'smallButtonWhite1', 
'smallButtonRed0', 'smallButtonRed1', 'smallButtonBlue0', 'smallButtonBlue1', 'smallButtonYellow0', 
'smallButtonYellow1', 'smallButtonGreen0', 'smallButtonGreen1', 'mediumButtonWhite', 'mediumButtonRed', 
'mediumButtonBlue', 'mediumButtonYellow', 'mediumButtonGreen', 'bigButtonRed', 'rfidScanner', 'plugboard', 
'captainsChair', 'keypad', 'touchSensor'];

const None = HardwareTypes.Color.None;
const defaultHardwareState: HardwareTypes.HardwareState = {
  switch0: {up: true, label: 'switch0', lit: false},
    switch1: {up: true, label: 'switch1', lit: false},
    switch2: {up: true, label: 'switch2', lit: false},
    switch3: {up: true, label: 'switch3', lit: false},
    smallButtonWhite0: {pressed: false, label: 'smallButtonWhite0', lit: false},
    smallButtonWhite1: {pressed: false, label: 'smallButtonWhite1', lit: false},
    smallButtonRed0: {pressed: false, label: 'smallButtonRed0', lit: false},
    smallButtonRed1: {pressed: false, label: 'smallButtonRed1', lit: false},
    smallButtonBlue0: {pressed: false, label: 'smallButtonBlue0', lit: false},
    smallButtonBlue1: {pressed: false, label: 'smallButtonBlue1', lit: false},
    smallButtonYellow0: {pressed: false, label: 'smallButtonYellow0', lit: false},
    smallButtonYellow1: {pressed: false, label: 'smallButtonYellow1', lit: false},
    smallButtonGreen0: {pressed: false, label: 'smallButtonGreen0', lit: false},
    smallButtonGreen1: {pressed: false, label: 'smallButtonGreen1', lit: false},
    mediumButtonWhite: {pressed: false, label: 'mediumButtonWhite', lit: false},
    mediumButtonRed: {pressed: false, label: 'mediumButtonRed', lit: false},
    mediumButtonBlue: {pressed: false, label: 'mediumButtonBlue', lit: false},
    mediumButtonYellow: {pressed: false, label: 'mediumButtonYellow', lit: false},
    mediumButtonGreen: {pressed: false, label: 'mediumButtonGreen', lit: false},
    bigButtonRed: {pressed: false, label: 'bigButtonRed', lit: false},
    rfidScanner: {},
    plugboard: {slot0: None, slot1: None, slot2: None, slot3: None},
    captainsChair: {},
    keypad: {},
    touchSensor: {},
    enabledMapping: {
      switch0: true,
      switch1: true,
      switch2: true,
      switch3: true,
      smallButtonWhite0: true,
      smallButtonWhite1: true,
      smallButtonRed0: true,
      smallButtonRed1: true,
      smallButtonBlue0: true,
      smallButtonBlue1: true,
      smallButtonYellow0: true,
      smallButtonYellow1: true,
      smallButtonGreen0: true,
      smallButtonGreen1: true,
      mediumButtonWhite: true,
      mediumButtonRed: true,
      mediumButtonBlue: true,
      mediumButtonYellow: true,
      mediumButtonGreen: true,
      bigButtonRed: true,
      rfidScanner: true,
      plugboard: true,
      captainsChair: true,
      keypad: true,
      touchSensor: true
    },
};

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
    hardwareState.enabledMapping[name] = enabled;
    this.setState({clients: this.state.clients, serverUp: this.state.serverUp, hardware: hardwareState});
  }

  constructor(props: {}) {
    super(props);
    this.state = {clients: [], serverUp: false, hardware: defaultHardwareState};
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
          {stateList.map(e => {
              var enabled: boolean = this.state.hardware.enabledMapping[e];
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