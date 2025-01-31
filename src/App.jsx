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
  const [activePlaylistButton, setActivePlaylistButton] = useState(null); // Track active playlist button
  const [activeSilverButton, setActiveSilverButton] = useState(null); // Track silver buttons separately

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

  const handlePlaylistToggle = (buttonId) => {
    if (activeSilverButton !== "extra-1") {
      setActivePlaylistButton((prev) => {
        const newState = prev === buttonId ? null : buttonId;
        
        // If a 1-5 button is selected while no silver button is active, activate "3"
        if (newState !== null && !activeSilverButton) {
          setActiveSilverButton("extra-3");
        }

        return newState;
      });
    }
  };

  const handleSilverToggle = (buttonId) => {
    setActiveSilverButton((prev) => {
      const newState = prev === buttonId ? null : buttonId;

      // If deselecting "2" and no other silver button is active, clear 1-5 buttons
      if (buttonId === "extra-2" && newState === null) {
        setActivePlaylistButton(null);
      }

      // If "3" is deselected, also clear any active 1-5 buttons
      if (buttonId === "extra-3" && newState === null) {
        setActivePlaylistButton(null);
      }

      return newState;
    });

    // Disable 1-5 buttons when "1" silver button is active
    if (buttonId === "extra-1") {
      setActivePlaylistButton(null);
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
        
        {/* Silver Buttons */}
        {["extra-3", "extra-2", "extra-1"].map((num) => (
          <button
            key={num}
            className={`extra-button ${activeSilverButton === num ? "active-silver" : ""}`}
            onClick={() => handleSilverToggle(num)}
          >
            <span className={activeSilverButton === num ? "active-red" : ""}>{num.replace('extra-', '')}</span>
          </button>
        ))}

        {showPicker && (
          <div className="color-picker-container">
            <ColorPicker onChange={setColorState} />
          </div>
        )}

        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            className={`h-button h${num}-button`}
            onClick={() => handlePlaylistToggle(`h${num}`)}
            disabled={activeSilverButton === "extra-1"} // Disable if "1" silver button is active
          >
            <span className={activePlaylistButton === `h${num}` ? "active-red" : ""}>{num}</span>
          </button>
        ))}
        {showMusic && <Music isVisible={showMusic} onClose={toggleMusic} />} {/* Render Music component */}
        
        {/* New Text Element */}
        <div className="handwriting-text">Zero Amp Music</div>
      </div>
    </Provider>
  );
};

export default App;