import * as React from 'react';
import './App.css';
// @ts-ignore
import Webcam from 'react-webcam';

class App extends React.Component<{}, {}> {

  render() {
    return <Webcam/>;
  }
}

export default App;
