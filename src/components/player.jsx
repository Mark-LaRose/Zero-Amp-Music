import React from "react";
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
} from "../redux/playlistSlice";
import "../styles/player.css";
import path from "path-browserify";

const Player = () => {
  const dispatch = useDispatch();
  const { activePlaylist, playlists, currentSong, isPlaying } = useSelector(
    (state) => state.playlist
  );

  const baseDir = window.electron.baseDir || "";

  const handlePlay = () => {
  if (!currentSong && playlists[activePlaylist]?.length > 0) {
    const firstSong = playlists[activePlaylist][0];
    dispatch(setCurrentSong(firstSong)); // Auto-select first song
    window.electron.audio.play(path.join(baseDir, activePlaylist, firstSong));
    dispatch(playSong());
  } else if (currentSong) {
    window.electron.audio.play(path.join(baseDir, activePlaylist, currentSong));
    dispatch(playSong());
  }
};

  const handlePause = () => {
    window.electron.audio.pause(); // 🔹 Send pause command to Electron
    dispatch(pauseSong());
  };

  const handleStop = () => {
    window.electron.audio.stop();
    dispatch(pauseSong()); // Pause instead of deselecting song
  };

  const handleNext = () => {
    dispatch(playNextSong()); // 🔹 Update Redux state
    if (currentSong) {
      const songPath = path.join(baseDir, activePlaylist, currentSong);
      window.electron.audio.play(songPath); // 🔹 Play next song
    }
  };

  const handlePrevious = () => {
    dispatch(playPreviousSong()); // 🔹 Update Redux state
    if (currentSong) {
      const songPath = path.join(baseDir, activePlaylist, currentSong);
      window.electron.audio.play(songPath); // 🔹 Play previous song
    }
  };

  const handleShuffle = () => {
    dispatch(shuffleSong()); // 🔹 Update Redux state
    if (currentSong) {
      const songPath = path.join(baseDir, activePlaylist, currentSong);
      window.electron.audio.play(songPath); // 🔹 Play shuffled song
    }
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
          {currentSong ? `Currently Playing: ${currentSong.replace(/\.[^/.]+$/, "")}` : "Currently Playing: [No Song Selected]"}
          </span>
        </p>
      </div>

      {/* Player Controls */}
      <div className="player-controls">
        <button className="player-button shuffle-button" onClick={handleShuffle}></button>
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