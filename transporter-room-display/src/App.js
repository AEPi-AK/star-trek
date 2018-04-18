import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 1,
      images: [
        {
          filename: './img/1.png',
          active: false
        },
        {
          filename: './img/2.png',
          active: true
        },
        {
          filename: './img/3.png',
          active: false
        },
        {
          filename: './img/4.png',
          active: false
        },
        {
          filename: './img/5.png',
          active: false
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
    if (e.keyCode === 37) {
      this.boundSetActiveImage(
        (this.state.activeIndex + 1) % this.state.images.length
      );
    } else if (e.keyCode === 39) {
      this.boundSetActiveImage(
        (this.state.activeIndex - 1) % this.state.images.length
      );
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
        <div id="main-image-container">
          <img id="main-image" src={activeImage} />
        </div>
        <img id="arrows" src="./img/arrow-keys.png" />
        <div id="thumbnail-container">{thumbnailImages}</div>
      </div>
    );
  }
}

export default App;
