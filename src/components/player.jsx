import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setActivePlaylist,
  setCurrentSong,
  playSong,
  pauseSong,
  stopSong,
} from "../redux/playlistSlice"; // Import Redux actions
import "../styles/player.css";

const Player = () => {
  const dispatch = useDispatch();
  const { activePlaylist, playlists, currentSong, isPlaying } = useSelector(
    (state) => state.playlist
  );

  const handlePlaylistSelect = (playlist) => {
    const newSelection = activePlaylist === playlist ? "general" : playlist;
    dispatch(setActivePlaylist(newSelection));
  };

  const handlePlay = () => {
    if (!currentSong && playlists[activePlaylist]?.length > 0) {
      // Play the first song in the active playlist if none is selected
      dispatch(setCurrentSong(playlists[activePlaylist][0]));
    }
    dispatch(playSong());
  };

  const handlePause = () => {
    dispatch(pauseSong());
  };

  const handleStop = () => {
    dispatch(stopSong());
  };

  const handleNext = () => {
    if (!currentSong || playlists[activePlaylist]?.length === 0) return;
    const currentIndex = playlists[activePlaylist].indexOf(currentSong);
    const nextIndex = (currentIndex + 1) % playlists[activePlaylist].length;
    dispatch(setCurrentSong(playlists[activePlaylist][nextIndex]));
    dispatch(playSong());
  };

  const handlePrevious = () => {
    if (!currentSong || playlists[activePlaylist]?.length === 0) return;
    const currentIndex = playlists[activePlaylist].indexOf(currentSong);
    const prevIndex =
      (currentIndex - 1 + playlists[activePlaylist].length) %
      playlists[activePlaylist].length;
    dispatch(setCurrentSong(playlists[activePlaylist][prevIndex]));
    dispatch(playSong());
  };

  const handleShuffle = () => {
    if (playlists[activePlaylist]?.length === 0) return;
    const randomIndex = Math.floor(
      Math.random() * playlists[activePlaylist].length
    );
    dispatch(setCurrentSong(playlists[activePlaylist][randomIndex]));
    dispatch(playSong());
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
            activePlaylist === "general" ? "active" : ""
          }`}
          onClick={() => handlePlaylistSelect("general")}
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
          onClick={handleShuffle}
        ></button>
        <button
          className="player-button backward-button"
          onClick={handlePrevious}
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
          onClick={handleNext}
        ></button>
      </div>
    </div>
  );
};

export default Player;
