import * as React from 'react';
import './App.css';
// @ts-ignore
import Webcam, { WebcamProps } from 'react-webcam';
  
class App extends React.Component<{}, {time: number, countDown: boolean, webcam: any}> {

  setCamera(webcam: any) {
    this.setState({webcam: webcam});
  }

  capture() {
    // @ts-ignore
    const img = this.state.webcam.getScreenshot();
    // Send message to server to take picture and save to file
    // Probably python cv2 script
  }

  onTimeElapsed() {
    if (this.state.time === 0) {
      console.log('Picture time!');
      this.capture();
      this.setState({countDown: false});
    } else {
      console.log('Time remaining: ', this.state.time);
      var newTime: number = this.state.time - 1;
      this.setState({time: newTime});
      setTimeout(this.onTimeElapsed, 1000);
    }
  }

  beginCountDown() {
    this.setState({time: 5, countDown: true});
    setTimeout(this.onTimeElapsed, 1000);
  }

  constructor(props: {}) {
    super(props);
    this.state = {time: 5, countDown: false, webcam: null};
    this.capture = this.capture.bind(this);
    this.beginCountDown = this.beginCountDown.bind(this);
    this.onTimeElapsed = this.onTimeElapsed.bind(this);
    this.setCamera = this.setCamera.bind(this);
  }

  render() {

    const countDownTimer = (this.state.countDown ? <div> {this.state.time} </div> : <div />);

    return (
           <div>
              <Webcam
                audio={false}
                height={350}
                ref={this.setCamera}
                screenshotFormat="image/jpeg"
                width={350}
              />
              {countDownTimer}
              <button onClick={this.beginCountDown}>Beam me up, Scottie</button>
            </div>);
  }
}

export default App;
