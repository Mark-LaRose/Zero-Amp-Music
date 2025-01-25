import React, { useState, useEffect } from "react";
import path from "path-browserify";

const Music = ({ isVisible }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState("library");
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, song: null });

  // Load songs from the current playlist folder
  const loadSongs = async () => {
    const baseDir = window.electron.baseDir || "";
    const folderPath = path.join(baseDir, currentPlaylist);
    try {
      const { success, files } = await window.electron.fileSystem.readDirectory(folderPath);
      if (success) {
        setSongs(files);
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error("Error loading songs:", error);
      setSongs([]);
    }
  };

  useEffect(() => {
    loadSongs();
  }, [currentPlaylist]);

  const handleAddMusic = async () => {
    try {
      const { canceled, filePaths } = await window.electron.dialog.showOpenDialog({
        filters: [{ name: "Audio Files", extensions: ["mp3", "wav"] }],
        properties: ["openFile", "multiSelections"],
      });

      if (!canceled && filePaths) {
        const baseDir = window.electron.baseDir || "";
        const targetFolder = path.join(baseDir, currentPlaylist);

        filePaths.forEach((filePath) => {
          const songName = path.basename(filePath);
          const targetPath = path.join(targetFolder, songName);
          window.electron.fileSystem.copyFile(filePath, targetPath);
        });
        loadSongs();
      }
    } catch (error) {
      console.error("Error adding music:", error);
    }
  };

  const handleDoubleClick = (song) => {
    console.log(`Playing: ${song}`);
    const baseDir = window.electron.baseDir || "";
    const songPath = path.join(baseDir, currentPlaylist, song);
  
    try {
      window.electron.audio.play(songPath); // Directly pass the clean path
      console.log(`Started playing: ${songPath}`);
    } catch (error) {
      console.error("Error starting playback:", error);
    }
  }

  const handleRightClick = (event, song) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, song });
  };

  const handleAddToPlaylist = (playlist) => {
    console.log(`Adding "${contextMenu.song}" to Playlist ${playlist}`);
    const baseDir = window.electron.baseDir || "";
    const sourcePath = path.join(baseDir, currentPlaylist, contextMenu.song);
    const targetPath = path.join(baseDir, playlist, contextMenu.song);

    window.electron.fileSystem.copyFile(sourcePath, targetPath);
    setContextMenu({ visible: false });
  };

  const handleRename = () => {
    const baseDir = window.electron.baseDir || "";
    const oldPath = path.join(baseDir, currentPlaylist, contextMenu.song);
    const newName = prompt("Enter new name for the song:", contextMenu.song);

    if (newName) {
      const newPath = path.join(baseDir, currentPlaylist, newName);
      window.electron.fileSystem.rename(oldPath, newPath);
      loadSongs();
    }
    setContextMenu({ visible: false });
  };

  const handleDelete = () => {
    const baseDir = window.electron.baseDir || "";
    const songPath = path.join(baseDir, currentPlaylist, contextMenu.song);

    if (window.confirm(`Are you sure you want to delete "${contextMenu.song}"?`)) {
      window.electron.fileSystem.delete(songPath);
      loadSongs();
    }
    setContextMenu({ visible: false });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false });
  };

  const handleSelectSong = (song) => {
    setSelectedSong(song);
  };

  if (!isVisible) return null;

  return (
    <div className="music-window" onClick={closeContextMenu}>
      <div className="top-buttons">
        <button
          onClick={() => setCurrentPlaylist("library")}
          className={currentPlaylist === "library" ? "active" : ""}
        >
          Library
        </button>
        <button onClick={handleAddMusic}>Add Music</button>
      </div>
      <div className="playlist-buttons">
        {["1", "2", "3", "4", "5"].map((playlist, index) => (
          <button
            key={index}
            onClick={() => setCurrentPlaylist(playlist)}
            className={currentPlaylist === playlist ? "active" : ""}
          >
            {playlist}
          </button>
        ))}
      </div>
      <ul className="song-list">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <li
              key={index}
              onDoubleClick={() => handleDoubleClick(song)}
              onContextMenu={(e) => handleRightClick(e, song)}
              onClick={() => handleSelectSong(song)}
              className={`song-item ${selectedSong === song ? "selected" : ""}`}
            >
              {song}
            </li>
          ))
        ) : (
          <li className="song-item">No songs found</li>
        )}
      </ul>
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {["1", "2", "3", "4", "5"].map((playlist, index) => (
            <div
              key={index}
              className="context-menu-item"
              onClick={() => handleAddToPlaylist(playlist)}
            >
              Add to Playlist {playlist}
            </div>
          ))}
          <div className="context-menu-item" onClick={handleRename}>
            Rename
          </div>
          <div className="context-menu-item" onClick={handleDelete}>
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default Music;