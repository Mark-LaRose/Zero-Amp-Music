const { contextBridge, ipcRenderer } = require("electron");
const path = require("path-browserify");

const baseDir = process.env.MUSIC_DIR || "D:/TheCode/WorkingProjects/ZeroAmpMusic/public/music";
const audio = new Audio();
let playlist = [];
let currentIndex = 0;
let isAutoPlayAllowed = false;

// Format file paths to handle spaces and special characters properly
const formatFilePath = (filePath) => {
  try {
    const formattedPath = `file:///${filePath.replace(/\\/g, "/")}`;
    return formattedPath;
  } catch {
    return filePath;
  }
};

// Function to play a specific song
const playSong = (filePath) => {
  try {
    const formattedPath = formatFilePath(filePath);

    if (audio.src !== formattedPath) {
      audio.src = formattedPath;
    }

    if (isAutoPlayAllowed) {
      audio.play().catch(() => {});
    }

    // Auto-play next song when the current one ends
    audio.onended = () => {
      ipcRenderer.send("audio:ended");
    };
  } catch {}
};

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld("electron", {
  baseDir,

  dialog: {
    showOpenDialog: (options) => ipcRenderer.invoke("dialog:openFile", options),
  },

  // Update playlist from renderer
  setPlaylist: (newPlaylist) => {
    playlist = newPlaylist;
    currentIndex = 0;
    isAutoPlayAllowed = true;
  },

  // Get the current playlist
  getPlaylist: () => playlist,

  // File system operations
  fileSystem: {
    readDirectory: async (dir) => {
      try {
        return await ipcRenderer.invoke("fs:readDirectory", dir);
      } catch {
        return { success: false, files: [] };
      }
    },

    copyFile: async (source, destination) => {
      try {
        return await ipcRenderer.invoke("fs:copyFile", { source, destination });
      } catch {
        return { success: false };
      }
    },

    rename: async (oldPath, newPath) => {
      try {
        return await ipcRenderer.invoke("fs:rename", { oldPath, newPath });
      } catch {
        return { success: false };
      }
    },

    delete: async (filePath) => {
      try {
        return await ipcRenderer.invoke("fs:delete", filePath);
      } catch {
        return { success: false };
      }
    },
  },

  // Audio playback functionality
  audio: {
    play: (filePath) => {
      try {
        isAutoPlayAllowed = true;
        if (filePath) {
          playSong(filePath);
        } else if (audio.src) {
          audio.play();
        }
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    },

    pause: () => {
      try {
        if (!audio.paused) {
          audio.pause();
        }
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    },

    stop: () => {
      try {
        audio.pause();
        audio.currentTime = 0;
        isAutoPlayAllowed = false;
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    },

    setVolume: (volume) => {
      try {
        audio.volume = volume / 100;
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    },

    isPaused: () => audio.paused,

    // Notify React when a song finishes playing
    onSongEnd: (callback) => {
      ipcRenderer.on("play-next-song", callback);
    },

    // Play next song in playlist
    playNext: () => {
      if (playlist.length > 0) {
        currentIndex = (currentIndex + 1) % playlist.length;
        isAutoPlayAllowed = true;
        playSong(path.join(baseDir, playlist[currentIndex]));
      }
    },

    // Play previous song in playlist
    playPrevious: () => {
      if (playlist.length > 0) {
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        isAutoPlayAllowed = true;
        playSong(path.join(baseDir, playlist[currentIndex]));
      }
    },
  },

  // Handle stopping playback for silver buttons
  stopOnSilverButton: () => {
    audio.pause();
    audio.currentTime = 0;
    isAutoPlayAllowed = false;
  }
});