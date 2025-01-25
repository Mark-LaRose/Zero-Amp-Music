import React, { useState, useEffect, useRef } from 'react';
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
  const [currentPlaylist, setCurrentPlaylist] = useState('library');
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(new Audio());

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

  const handlePlay = () => {
    if (currentSong) {
      audioRef.current.src = currentSong.path;
      audioRef.current.play();
    } else {
      alert('No song selected!');
    }
  };

  const handlePause = () => {
    audioRef.current.pause();
  };

  const handleStop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const handleNext = () => {
    console.log('Next song functionality not yet implemented.');
  };

  const handlePrevious = () => {
    console.log('Previous song functionality not yet implemented.');
  };

  const handleShuffle = () => {
    console.log('Shuffle functionality not yet implemented.');
  };

  const handlePlaylistSelect = (playlist) => {
    setCurrentPlaylist(playlist);
    console.log(`Playlist switched to: ${playlist}`);
  };

  const handleSongSelect = (song) => {
    const baseDir = window.electron.baseDir || '';
    const songPath = `${baseDir}\\${currentPlaylist}\\${song}`;
    setCurrentSong({ name: song, path: songPath });
    console.log(`Song selected: ${song}`);
  };

  return (
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
      <Player 
        color={color} 
        currentSong={currentSong?.name}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onShuffle={handleShuffle}
        onSelectPlaylist={handlePlaylistSelect}
      />
      <button className="color-picker-button" onClick={togglePicker}></button>
      <button className="music-button" onClick={toggleMusic}>M</button>
      {showPicker && (
        <div className="color-picker-container">
          <ColorPicker onChange={setColorState} />
        </div>
      )}
      {showMusic && (
        <Music 
          isVisible={showMusic} 
          currentPlaylist={currentPlaylist} 
          onSongSelect={handleSongSelect} 
          onClose={toggleMusic} 
        />
      )}
      <div className="handwriting-text">Zero Amp Music</div>
    </div>
  );
};

export default App;