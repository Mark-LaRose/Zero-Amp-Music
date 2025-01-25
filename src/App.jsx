import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux'; // Import Provider
import store from './redux/store'; // Import your store
import Player from './components/player.jsx';
import Speaker from './components/speaker.jsx';
import ColorPicker from './components/colorpicker.jsx';
import Visual from './components/visual.jsx';
import Music from './components/music.jsx'; // Import the new Music component
import './styles/player.css';
import './styles/speaker.css';
import './styles/visual.css';
import './styles/music.css'; // Import the new Music CSS

const App = () => {
  const [color, setColorState] = useState(localStorage.getItem('color') || '#00ff00');
  const [showPicker, setShowPicker] = useState(false);
  const [showMusic, setShowMusic] = useState(false); // State for music window visibility
  const [autoColor, setAutoColor] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    localStorage.setItem('color', color);
    setColor(color);
  }, [color]);

  const setColor = (newColor) => {
    document.documentElement.style.setProperty('--theme-color', newColor);
    document.documentElement.style.setProperty('--theme-glow', `0 0 15px ${newColor}`);
  };

  const togglePicker = () => setShowPicker(!showPicker);
  const toggleMusic = () => setShowMusic(!showMusic); // Toggle function for music window

  const toggleAutoColor = () => {
    setAutoColor(!autoColor);
    if (!autoColor) {
      const id = setInterval(() => {
        setColorState(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
      }, 3000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  return (
    <Provider store={store}>
      <div className="app">
        <button 
          className={`random-color-button ${autoColor ? 'active' : ''}`} 
          onClick={toggleAutoColor} 
          style={{ background: autoColor ? color : 'conic-gradient(white, grey, silver, silver, white, grey, silver, silver, silver, silver)' }}
        >
          R
        </button>
        <Visual />
        <Speaker color={color} />
        <Player color={color} />
        <button className="color-picker-button" onClick={togglePicker}></button>
        <button className="music-button" onClick={toggleMusic}>M</button> {/* New button to open music window */}
        {/* Additional Buttons */}
        <button className="extra-button">3</button>
        <button className="extra-button">2</button>
        <button className="extra-button">1</button>
        {showPicker && (
          <div className="color-picker-container">
            <ColorPicker onChange={setColorState} />
          </div>
        )}
        <button className="h-button">1</button>
        <button className="h2-button">2</button>
        <button className="h3-button">3</button>
        <button className="h4-button">4</button>
        <button className="h5-button">5</button>
        {showMusic && <Music isVisible={showMusic} onClose={toggleMusic} />} {/* Render Music component */}
        
        {/* New Text Element */}
        <div className="handwriting-text">Zero Amp Music</div>
      </div>
    </Provider>
  );
};

export default App;