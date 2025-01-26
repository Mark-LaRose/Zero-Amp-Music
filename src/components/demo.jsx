import React, { useState, useEffect } from "react";
import path from "path-browserify";

const Music = ({ isVisible }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState("library");
  const [songs, setSongs] = useState([]);

  // Load songs from the current playlist folder
  const loadSongs = async () => {
    const baseDir = window.electron.baseDir || ""; // Defined in preload.js
    const folderPath = `${baseDir}\\${currentPlaylist}`;
    try {
      const { success, files } = await window.electron.fileSystem.readDirectory(folderPath);
      if (success) {
        console.log(`Files in folder (${currentPlaylist}):`, files); // Debugging
        setSongs(files);
      } else {
        console.error(`Error reading folder: ${folderPath}`);
        setSongs([]);
      }
    } catch (error) {
      console.error("Error loading songs:", error);
      setSongs([]); // Fallback to empty array
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
        const baseDir = window.electron.baseDir || ""; // Defined in preload.js
        const targetFolder = `${baseDir}\\${currentPlaylist}`;

        filePaths.forEach((filePath) => {
          const songName = filePath.split(/[/\\]/).pop(); // Extract file name
          const targetPath = `${targetFolder}\\${songName}`;
          window.electron.fileSystem.copyFile(filePath, targetPath);
          console.log(`File copied: ${filePath} -> ${targetPath}`); // Debugging
        });
        loadSongs(); // Refresh song list
      }
    } catch (error) {
      console.error("Error adding music:", error);
    }
  };

  const handleRightClick = (song) => {
    console.log(`Right-clicked on: ${song}`);
    // Additional right-click functionality can be added here
  };

  if (!isVisible) return null;

  return (
    <div className="music-window">
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
              onContextMenu={() => handleRightClick(song)}
              className="song-item"
            >
              {song}
            </li>
          ))
        ) : (
          <li className="song-item">No songs found</li> // Message if no songs are found
        )}
      </ul>
    </div>
  );
};

export default Music;