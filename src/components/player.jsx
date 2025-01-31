import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setActivePlaylist,
  setCurrentSong,
  playSong,
  pauseSong,
  stopSong,
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
      dispatch(setCurrentSong(playlists[activePlaylist][0]));
    }
    if (currentSong) {
      const songPath = path.join(baseDir, activePlaylist, currentSong);
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

  const handlePlaylistSelect = (playlist) => {
    const newSelection = activePlaylist === playlist ? "library" : playlist;
    dispatch(setActivePlaylist(newSelection));
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
        />
        <div className="vol-label">vol</div>
      </div>

      {/* Playlist Controls */}
      <div className="playlist-controls">
        <button
          className={`playlist-button ${
            activePlaylist === "library" ? "active" : ""
          }`}
          onClick={() => handlePlaylistSelect("library")}
        >
          Library
        </button>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            className={`playlist-button ${
              activePlaylist === `${num}` ? "active" : ""
            }`}
            onClick={() => handlePlaylistSelect(`${num}`)}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Player Display */}
      <div className="player-display">
        <p className="player-info">
          Currently Playing: {currentSong || "[No Song Selected]"}
        </p>
      </div>

      {/* Player Controls */}
      <div className="player-controls">
        <button
          className="player-button shuffle-button"
          onClick={() => {}}
        ></button>
        <button
          className="player-button backward-button"
          onClick={() => {}}
        ></button>
        <button
          className="player-button stop-button"
          onClick={handleStop}
        ></button>
        <button
          className="player-button pause-button"
          onClick={handlePause}
          disabled={!isPlaying}
        ></button>
        <button
          className="player-button play-button"
          onClick={handlePlay}
          disabled={isPlaying}
        ></button>
        <button
          className="player-button forward-button"
          onClick={() => {}}
        ></button>
      </div>
    </div>
  );
};

export default Player;
