import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 5,
      images: [
        {
          filename: './img/6.png',
          active: false
        },
        {
          filename: './img/5.png',
          active: false
        },
        {
          filename: './img/4.png',
          active: false
        },
        {
          filename: './img/3.png',
          active: false
        },
        {
          filename: './img/2.png',
          active: false
        },
        {
          filename: './img/1.png',
          active: true
        }
      ]
    };
    this.boundKeyPress = this.keyPress.bind(this);
    this.boundSetActiveImage = this.setActiveImage.bind(this);
  }

  componentWillMount() {
    document.addEventListener('keydown', this.boundKeyPress);
  }

  keyPress(e) {
    console.log('key!');
    if (
      e.keyCode === 37 &&
      this.state.activeIndex !== this.state.images.length - 1
    ) {
      this.boundSetActiveImage(
        (this.state.activeIndex + 1) % this.state.images.length
      );
    } else if (e.keyCode === 39 && this.state.activeIndex !== 0) {
      this.boundSetActiveImage(this.state.activeIndex - 1);
    }
  }

  setActiveImage(newIndex) {
    console.log(newIndex);
    let newImages = this.state.images;
    newImages[newIndex].active = true;
    newImages[this.state.activeIndex].active = false;
    this.setState({ images: newImages, activeIndex: newIndex });
  }

  render() {
    const activeImage = this.state.images.filter(img => img.active)[0].filename;
    const thumbnailImages = this.state.images.map(
      ({ filename, active, key }) => {
        if (active) {
          return (
            <div className="thumbnail-active" id={key}>
              <img className="thumbnail" src={filename} />
            </div>
          );
        } else {
          return <img className="thumbnail" src={filename} id={key} />;
        }
      }
    );
    return (
      <div className="App">
          <object
            id="main-image"
            type="text/html"
            data="http://localhost:8000/stream/0"
          />
        <div id="effect-layer">
          <div
            id="beam-layer"
            style={{
              opacity:
                1 - this.state.activeIndex / (this.state.images.length - 1)
            }}
          >
            <img id="beam-back" src="./img/light-beam.png" />
            <img id="beam-left" src="./img/light-beam.png" />
            <img id="beam-left-mid" src="./img/light-beam.png" />
            <img id="beam-right-mid" src="./img/light-beam.png" />
            <img id="beam-right" src="./img/light-beam.png" />
          </div>
          <img id="overlay-layer" src="./img/overlay.png" />
        </div>
        <img id="main-image-container" src="./img/beamup-frame.png" />
        <img id="arrow-keys" src="./img/beamup-arrows.png" />
        <div id="thumbnail-container">{thumbnailImages}</div>
      </div>
    );
  }
}

export default App;
