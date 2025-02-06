import React, { useState, useEffect } from "react";
import path from "path-browserify";
import { useDispatch } from "react-redux";
import { setCurrentSong } from "../redux/playlistSlice";

const Music = ({ isVisible }) => {
  const dispatch = useDispatch();
  const [currentPlaylist, setCurrentPlaylist] = useState("library");
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, song: null });
  const [renameModal, setRenameModal] = useState({ visible: false, oldName: "", newName: "" });
  const [deleteModal, setDeleteModal] = useState({ visible: false, song: "" });

  // Load songs from the current playlist folder
  const loadSongs = async () => {
    const baseDir = window.electron.baseDir || "";
    const folderPath = path.join(baseDir, currentPlaylist);
  
    try {
      const { success, files } = await window.electron.fileSystem.readDirectory(folderPath);
      setSongs(success ? files : []);
    } catch {
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
        const targetFolder = `${baseDir}\\library`;
  
        filePaths.forEach((filePath) => {
          const songName = filePath.split(/[\\/]/).pop();
          const targetPath = `${targetFolder}\\${songName}`;
          window.electron.fileSystem.copyFile(filePath, targetPath);
        });
  
        loadSongs();
      }
    } catch {}
  };

  const handleDoubleClick = (song) => {
    const baseDir = window.electron.baseDir || "";
    const songPath = path.join(baseDir, currentPlaylist, song);
  
    try {
      window.electron.audio.play(songPath);
      dispatch(setCurrentSong(song)); 
      setSelectedSong(song);
    } catch {}
  };

  const handleRightClick = (event, song) => {
    event.preventDefault();

    // Get the window height and click position
    const windowHeight = window.innerHeight;
    const contextMenuHeight = 150;
    const isLowerHalf = event.clientY > windowHeight * 0.6;

    // Set the context menu position dynamically
    const yPosition = isLowerHalf
      ? event.clientY - contextMenuHeight
      : event.clientY;

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: yPosition,
      song,
    });
  };

  const handleAddToPlaylist = (playlist) => {
    const baseDir = window.electron.baseDir || "";
    const sourcePath = path.join(baseDir, currentPlaylist, contextMenu.song);
    const targetPath = path.join(baseDir, playlist, contextMenu.song);

    window.electron.fileSystem.copyFile(sourcePath, targetPath);
    setContextMenu({ visible: false });
  };

  const submitRename = async () => {
    if (!renameModal?.newName?.trim()) return;
  
    const baseDir = window.electron.baseDir || "";
    const oldPath = path.join(baseDir, currentPlaylist, renameModal?.oldName);
    const newPath = path.join(baseDir, currentPlaylist, renameModal?.newName?.trim());
  
    const result = await window.electron.fileSystem.rename(oldPath, newPath);
  
    if (result.success) {
      loadSongs();
    }
  
    setRenameModal({ visible: false, oldName: "", newName: "" });
  };

  const confirmDelete = async () => {
    const baseDir = window.electron.baseDir || "";
    const songPath = path.join(baseDir, currentPlaylist, deleteModal?.song);
  
    const result = await window.electron.fileSystem.delete(songPath);
    
    if (result.success) {
      loadSongs();
    }
  
    setDeleteModal({ visible: false, song: "" });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false });
  };

  const handleSelectSong = (song) => {
    dispatch(setCurrentSong(song));
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
          <div
            className="context-menu-item"
            onClick={() => setRenameModal({ visible: true, oldName: contextMenu.song, newName: "" })}
          >
            Rename
          </div>
          <div
            className="context-menu-item"
            onClick={() => setDeleteModal({ visible: true, song: contextMenu.song })}
          >
            Delete
          </div>
        </div>
      )}

      {renameModal.visible && (
        <div className="modal">
          <h3>Rename File</h3>
          <input
            type="text"
            value={renameModal.newName}
            onChange={(e) => setRenameModal({ ...renameModal, newName: e.target.value })}
            placeholder="Enter new file name"
          />
          <button onClick={submitRename}>Rename</button>
          <button onClick={() => setRenameModal({ visible: false, oldName: "", newName: "" })}>Cancel</button>
        </div>
      )}

      {deleteModal.visible && (
        <div className="modal">
          <h3>Are you sure you want to delete "{deleteModal.song}"?</h3>
          <button onClick={confirmDelete}>Delete</button>
          <button onClick={() => setDeleteModal({ visible: false, song: "" })}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Music;