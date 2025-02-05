import React, { useState, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";
import {
  setActivePlaylist,
  setCurrentSong,
  updatePlaylist,
  stopSong,
} from "./redux/playlistSlice";
import Player from "./components/player.jsx";
import Speaker from "./components/speaker.jsx";
import ColorPicker from "./components/colorpicker.jsx";
import Visual from "./components/visual.jsx";
import Music from "./components/music.jsx";
import "./styles/player.css";
import "./styles/speaker.css";
import "./styles/visual.css";
import "./styles/music.css";
import path from "path-browserify";
import { BsMusicNoteList } from "react-icons/bs";
import { FaMusic, FaYoutube } from "react-icons/fa";
import { IoRadioSharp } from "react-icons/io5";

const App = () => {
  const [color, setColorState] = useState(localStorage.getItem("color") || "#00ff00");
  const [showPicker, setShowPicker] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [autoColor, setAutoColor] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [activePlaylistButton, setActivePlaylistButton] = useState(null);
  const [activeSilverButton, setActiveSilverButton] = useState(null);

  useEffect(() => {
    localStorage.setItem("color", color);
    setColor(color);
  }, [color]);

  const setColor = (newColor) => {
    document.documentElement.style.setProperty("--theme-color", newColor);
    document.documentElement.style.setProperty("--theme-glow", `0 0 15px ${newColor}`);
  };

  const togglePicker = () => setShowPicker(!showPicker);
  const toggleMusic = () => setShowMusic(!showMusic);

  const toggleAutoColor = () => {
    setAutoColor(!autoColor);
    if (!autoColor) {
      const id = setInterval(() => {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        setColorState(randomColor);
      }, 3000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  return (
    <Provider store={store}>
      <AppContent
        color={color}
        setColorState={setColorState}
        showPicker={showPicker}
        togglePicker={togglePicker}
        showMusic={showMusic}
        toggleMusic={toggleMusic}
        autoColor={autoColor}
        toggleAutoColor={toggleAutoColor}
        activePlaylistButton={activePlaylistButton}
        setActivePlaylistButton={setActivePlaylistButton}
        activeSilverButton={activeSilverButton}
        setActiveSilverButton={setActiveSilverButton}
      />
    </Provider>
  );
};

const AppContent = ({
  color,
  setColorState,
  showPicker,
  togglePicker,
  showMusic,
  toggleMusic,
  autoColor,
  toggleAutoColor,
  activePlaylistButton,
  setActivePlaylistButton,
  activeSilverButton,
  setActiveSilverButton,
}) => {
  const dispatch = useDispatch();
  const baseDir = window.electron.baseDir || "";

  const handleSelectPlaylist = async (playlistName) => {
    const folderPath = path.join(baseDir, playlistName);

    try {
      const { success, files } = await window.electron.fileSystem.readDirectory(folderPath);
      if (success) {
        console.log(`📂 Loaded Playlist: ${playlistName}, Files:`, files);

        dispatch(updatePlaylist({ playlistName, songs: files }));
        dispatch(setActivePlaylist(playlistName));
        dispatch(setCurrentSong(files.length > 0 ? files[0] : null));

        window.electron.setPlaylist(files);
      } else {
        console.warn(`⚠️ No files found in playlist: ${playlistName}`);
        dispatch(setActivePlaylist(playlistName));
        dispatch(setCurrentSong(null));
      }
    } catch (error) {
      console.error("❌ Error reading directory:", error);
      dispatch(setActivePlaylist(playlistName));
      dispatch(setCurrentSong(null));
    }
  };

  const handlePlaylistToggle = (buttonId, playlistName) => {
    if (activeSilverButton !== "extra-1") {
      setActivePlaylistButton((prev) => {
        const newState = prev === buttonId ? null : buttonId;

        if (newState === null) {
          handleSelectPlaylist("library");
        } else {
          handleSelectPlaylist(playlistName);
        }

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

      if (buttonId === "extra-3") {
        if (newState === null) {
          dispatch(stopSong());
          window.electron.audio.stop();
          setActivePlaylistButton(null);
          dispatch(setActivePlaylist({ playlistName: null, songs: [] }));
          dispatch(setCurrentSong(null));
        } else {
          handleSelectPlaylist("library");
        }
      }

      if (buttonId === "extra-1" || buttonId === "extra-2") {
        dispatch(stopSong());
        window.electron.audio.stop();
      }

      return newState;
    });

    if (buttonId === "extra-1") {
      setActivePlaylistButton(null);
    }
  };

  // Icon mapping for buttons
  const iconMap = {
    "extra-3": FaMusic,
    "extra-2": IoRadioSharp,
    "extra-1": FaYoutube,
  };

  return (
    <div className="app">
      <button
        className={`random-color-button ${autoColor ? "active" : ""}`}
        onClick={toggleAutoColor}
        style={{
          background: autoColor
            ? color
            : "conic-gradient(white, grey, silver, silver, white, grey, silver, silver, silver, silver)",
        }}
      >
        ?
      </button>
      <Visual />
      <Speaker color={color} />
      <Player color={color} />
      <button className="color-picker-button" onClick={togglePicker}></button>
      <button className="music-button" onClick={toggleMusic}>
        <BsMusicNoteList />
      </button>

      {["extra-3", "extra-2", "extra-1"].map((num) => {
        const IconComponent = iconMap[num];

        return (
          <button
            key={num}
            className={`extra-button ${num}`} // Add unique class
            onClick={() => handleSilverToggle(num)}
          >
            <IconComponent className={activeSilverButton === num ? "active-red" : ""} />
          </button>
        );
      })}

      {showPicker && (
        <div className="color-picker-container">
          <ColorPicker onChange={setColorState} />
        </div>
      )}

      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          className={`h-button h${num}-button`}
          onClick={() => handlePlaylistToggle(`h${num}`, `${num}`)}
          disabled={activeSilverButton === "extra-1"}
        >
          <span className={activePlaylistButton === `h${num}` ? "active-green" : ""}>{num}</span>
        </button>
      ))}

      {showMusic && <Music isVisible={showMusic} onClose={toggleMusic} />}
      <div className="handwriting-text">Zero Amp Music</div>
    </div>
  );
};

export default App;