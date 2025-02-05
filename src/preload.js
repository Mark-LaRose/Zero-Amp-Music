const { contextBridge, ipcRenderer } = require("electron");
const path = require("path-browserify");

const baseDir = process.env.MUSIC_DIR || "D:/TheCode/WorkingProjects/ZeroAmpMusic/public/music";
const audio = new Audio();
let playlist = [];
let currentIndex = 0;
let isAutoPlayAllowed = false; // Allow autoplay by default

// Format file paths to handle spaces and special characters properly
const formatFilePath = (filePath) => {
  try {
    const formattedPath = `file://${filePath.replace(/\\/g, "/")}`;
    console.log(`🛠️ Corrected file path: ${formattedPath}`);
    return formattedPath;
  } catch (error) {
    console.error("❌ Error formatting file path:", error);
    return filePath;
  }
};

// Function to play a specific song
const playSong = (filePath) => {
  try {
    const formattedPath = formatFilePath(filePath);
    console.log(`▶️ Attempting to play: ${formattedPath}`);

    if (audio.src !== formattedPath) {
      audio.src = formattedPath; // Load new song only if different
    }

    if (isAutoPlayAllowed) {
      audio.play()
        .then(() => console.log(`🎶 Now playing: ${formattedPath}`))
        .catch((error) => console.error("❌ Error starting playback:", error));
    }

    // Auto-play next song when current one ends
    audio.onended = () => {
      console.log("🎵 Song ended, triggering next...");
      ipcRenderer.send("audio:ended");
    };
  } catch (error) {
    console.error("❌ Error playing audio:", error);
  }
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
    console.log("📂 Playlist updated:", playlist);
  },

  // Get the current playlist
  getPlaylist: () => playlist,

  // File system operations
  fileSystem: {
    readDirectory: async (dir) => {
      try {
        console.log(`📁 Reading directory: ${dir}`);
        const result = await ipcRenderer.invoke("fs:readDirectory", dir);
        console.log(`📃 Files in directory:`, result.files);
        return result;
      } catch (error) {
        console.error("❌ Error reading directory:", error);
        return { success: false, files: [] };
      }
    },
    copyFile: async (source, destination) => {
      try {
        return await ipcRenderer.invoke("fs:copyFile", { source, destination });
      } catch (error) {
        console.error("❌ Error copying file:", error);
        return { success: false, error: error.message };
      }
    },
    rename: async (oldPath, newPath) => {
      try {
        return await ipcRenderer.invoke("fs:rename", { oldPath, newPath });
      } catch (error) {
        console.error("❌ Error renaming file:", error);
        return { success: false, error: error.message };
      }
    },
    delete: async (filePath) => {
      try {
        return await ipcRenderer.invoke("fs:delete", filePath);
      } catch (error) {
        console.error("❌ Error deleting file:", error);
        return { success: false, error: error.message };
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
          console.log(`▶️ Resumed playback at ${audio.currentTime} sec: ${audio.src}`);
        }
      } catch (error) {
        console.error("❌ Error playing audio:", error);
      }
    },

    pause: () => {
      try {
        if (!audio.paused) {
          audio.pause();
          console.log(`⏸️ Audio paused at: ${audio.currentTime}`);
        }
      } catch (error) {
        console.error("❌ Error pausing audio:", error);
      }
    },

    stop: () => {
      try {
        audio.pause();
        audio.currentTime = 0;
        isAutoPlayAllowed = false;
        console.log("⏹️ Audio stopped");
      } catch (error) {
        console.error("❌ Error stopping audio:", error);
      }
    },

    setVolume: (volume) => {
      try {
        audio.volume = volume / 100;
        console.log(`🔊 Volume set to: ${volume}`);
      } catch (error) {
        console.error("❌ Error setting volume:", error);
      }
    },

    isPaused: () => audio.paused,

    // Notify React when a song finishes playing
    onSongEnd: (callback) => {
      console.log("🎵 onSongEnd event triggered"); // Add this line
      ipcRenderer.on("play-next-song", callback);
    },

    // Play next song in playlist
    playNext: () => {
      if (playlist.length > 0) {
        currentIndex = (currentIndex + 1) % playlist.length;
        console.log(`⏭️ Playing Next Song: ${playlist[currentIndex]}`);
        isAutoPlayAllowed = true;
        playSong(path.join(baseDir, playlist[currentIndex]));
      } else {
        console.warn("⚠️ No songs available in playlist.");
      }
    },

    // Play previous song in playlist
    playPrevious: () => {
      if (playlist.length > 0) {
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        console.log(`⏮️ Playing Previous Song: ${playlist[currentIndex]}`);
        isAutoPlayAllowed = true;
        playSong(path.join(baseDir, playlist[currentIndex]));
      } else {
        console.warn("⚠️ No songs available in playlist.");
      }
    },
  },

  // Handle stopping playback when silver buttons "1", "2", or deselecting "3"
  stopOnSilverButton: () => {
    console.log("⏹️ Stopping playback due to silver button selection/deselection.");
    audio.pause();
    audio.currentTime = 0;
    isAutoPlayAllowed = false;
  }
});