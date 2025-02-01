import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setActivePlaylist,
  setCurrentSong,
  playSong,
  pauseSong,
  stopSong,
  playNextSong,
  playPreviousSong,
  shuffleSong,
  updatePlaylist,
  toggleShuffle, // Added shuffle toggle
} from "../redux/playlistSlice";
import "../styles/player.css";
import path from "path-browserify";

const Player = () => {
  const dispatch = useDispatch();
  const { activePlaylist, playlists, currentSong, isPlaying, isShuffle } = useSelector(
    (state) => state.playlist
  );

  const baseDir = window.electron.baseDir || "";

  // Automatically play the next song when the current one ends
  useEffect(() => {
    window.electron.audio.onSongEnd(() => {
      if (isShuffle) {
        dispatch(shuffleSong());
      } else {
        dispatch(playNextSong());
      }
    });
  }, [dispatch, isShuffle]);

  // Play new song when `currentSong` updates
  useEffect(() => {
    if (currentSong && isPlaying) { // Only play if user has pressed play
      const songPath = path.join(baseDir, activePlaylist, currentSong);
      console.log(`▶️ Playing: ${songPath}`);
      window.electron.audio.play(songPath);
    }
  }, [currentSong, isPlaying, dispatch, activePlaylist, baseDir]);

  // Load playlist contents and update Redux
  const handleSelectPlaylist = async (playlistName) => {
    const folderPath = path.join(baseDir, playlistName);
  
    try {
      const { success, files } = await window.electron.fileSystem.readDirectory(folderPath);
      if (success) {
        console.log(`📂 Loaded Playlist: ${playlistName}, Files:`, files);
  
        dispatch(updatePlaylist({ playlistName, songs: files }));
        dispatch(setActivePlaylist(playlistName));
        dispatch(setCurrentSong(files.length > 0 ? files[0] : null)); // Just set, don't auto-play
        window.electron.setPlaylist(files);
      } else {
        console.warn(`⚠️ Failed to load playlist: ${playlistName}`);
        dispatch(setActivePlaylist(playlistName));
        dispatch(setCurrentSong(null));
      }
    } catch (error) {
      console.error("❌ Error reading directory:", error);
      dispatch(setActivePlaylist(playlistName));
      dispatch(setCurrentSong(null));
    }
  };

  const handlePlay = () => {
    if (!currentSong && playlists[activePlaylist]?.length > 0) {
      const firstSong = playlists[activePlaylist][0];
      dispatch(setCurrentSong(firstSong));
    } else if (currentSong) {
      const songPath = path.join(baseDir, activePlaylist, currentSong);
      console.log(`▶️ Playing: ${songPath}`);
      window.electron.audio.play(songPath);
      dispatch(playSong());
    }
  };

  const handlePause = () => {
    window.electron.audio.pause();
    dispatch(pauseSong());
  };

  const handleStop = () => {
    window.electron.audio.stop();
    dispatch(stopSong());
  };

  const handleNext = () => {
    if (isShuffle) {
      dispatch(shuffleSong());
    } else {
      dispatch(playNextSong());
      window.electron.audio.playNext(); // Electron handles next song
    }
  };

  const handlePrevious = () => {
    dispatch(playPreviousSong());
    window.electron.audio.playPrevious(); // Electron handles previous song
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const handleVolumeChange = (event) => {
    const volume = event.target.value;
    window.electron.audio.setVolume(volume);
  };

  return (
    <div className="player-container">
      {/* Volume Slider */}
      <div className="volume-slider-container">
        <input
          type="range"
          id="volume-slider-thumb"
          className="volume-slider"
          min="0"
          max="100"
          defaultValue="50"
          onChange={handleVolumeChange}
        />
        <div className="vol-label">vol</div>
      </div>

      {/* Player Display */}
      <div className="player-display">
        <p className="player-info">
          <span className="scrolling-text">
            {currentSong
              ? `Currently Playing: ${currentSong.replace(/\.[^/.]+$/, "")}`
              : "Currently Playing: [No Song Selected]"}
          </span>
        </p>
      </div>

      {/* Playlist Selection */}
      <div className="playlist-selection">
        {[1, 2, 3, 4, 5].map((num) => (
          <button key={num} onClick={() => handleSelectPlaylist(`${num}`)}>
            Playlist {num}
          </button>
        ))}
      </div>

      {/* Player Controls */}
      <div className="player-controls">
        <button 
          className={`player-button shuffle-button ${isShuffle ? "shuffle-active" : ""}`}  
          onClick={handleShuffle}
        >
          ?
        </button>
        <button className="player-button backward-button" onClick={handlePrevious}></button>
        <button className="player-button stop-button" onClick={handleStop}></button>
        <button className="player-button pause-button" onClick={handlePause} disabled={!isPlaying}></button>
        <button className="player-button play-button" onClick={handlePlay}></button>
        <button className="player-button forward-button" onClick={handleNext}></button>
      </div>
    </div>
  );
};

export default Player;