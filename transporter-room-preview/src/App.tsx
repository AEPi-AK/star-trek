import * as React from 'react';
import './App.css';
import './stylesheet.css';
import * as Socket from 'socket.io-client';

var socket = Socket('http://localhost:5000');

class App extends React.Component<
  {},
  { phase: number; percentDone: number; timer: number }
> {
  constructor(props: {}) {
    super(props);
    this.state = {
      phase: 0,
      percentDone: 0,
      timer: 3
    };
  }

  capture() {
    socket.emit('capture');
  }

  render() {
    if (this.state.phase === 0) {
      return (
        <div>
          <object
            id="video"
            type="text/html"
            data="http://localhost:5000/video_feed"
          />
          {/* <img id="video" src="img/webcam.png" /> */}
          <img id="foreground" src="img/foreground.png" />
          {/* <img id="capture-button" src="img/beam-up.png" onClick={e => this.capture()}/> */}
          <img
            id="capture-button"
            src="img/beam-up.png"
            onClick={() => {
              const webcamStartTime = Date.now();
              const interval = window.setInterval(() => {
                this.setState({
                  percentDone: (Date.now() - webcamStartTime) / 5000,
                  phase: 1
                });
                if (this.state.percentDone >= 1) {
                  window.clearInterval(interval);
                  this.setState({ phase: 1.5 });
                  const timerStartTime = Date.now();
                  const interval2 = window.setInterval(() => {
                    this.setState({
                      timer: Math.round(
                        3 - (Date.now() - timerStartTime) / 1000
                      )
                    });
                    if (this.state.timer <= 0) {
                      this.setState({ phase: 2, timer: 3 });
                      window.clearInterval(interval2);
                    }
                  }, 1000);
                }
              }, 10);
            }}
          />
        </div>
      );
    } else if (this.state.phase === 1) {
      const beamBarWidth = 460;
      return (
        <div>
          <object
            id="video"
            type="text/html"
            data="http://localhost:5000/video_feed"
          />
          {/* <img id="video" src="img/webcam.png" /> */}
          <img id="foreground" src="img/foreground.png" />
          <div id="beam-text">BEAMING</div> <div id="beam-background" />
          <div
            id="beam-loading"
            style={{ width: `${this.state.percentDone * beamBarWidth}px` }}
          />
        </div>
      );
    } else if (this.state.phase === 1.5) {
      return (
        <div>
          <object
            id="video"
            type="text/html"
            data="http://localhost:5000/video_feed"
          />
          {}
          <div id="countdown-text">{this.state.timer}</div>
          <img id="foreground" src="img/foreground.png" />
        </div>
      );
    } else if (this.state.phase === 2) {
      this.capture();
      setTimeout(() => {
        this.setState({ phase: 3 });
      }, 700);
      return (
        <div>
          <object
            id="video"
            type="text/html"
            data="http://localhost:5000/video_feed"
          />
          {}
          <div id="flash" />
          <img id="foreground" src="img/foreground.png" />
        </div>
      );
    } else {
      return (
        <div>
          <object
            id="video"
            type="text/html"
            data="http://localhost:5000/video_feed"
            style={{ maxWidth: '1px' }}
          />
          <img id="photo" src="img/beaming.gif" />
          <img id="rectangle" src="img/rectangle.png" />
          <img id="foreground" src="img/foreground.png" />
          <div id="end-text">
            Go to the Console at the back of the room, your video will be ready
            shortly!
          </div>
          <img
            id="next-button"
            src="img/next-crew.png"
            onClick={() => this.setState({ phase: 0 })}
          />
        </div>
      );
    }
  }
}

export default App;
