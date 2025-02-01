const { contextBridge, ipcRenderer } = require("electron");
const path = require("path-browserify");

// Define the direct file path to the 'music' directory
const baseDir = process.env.MUSIC_DIR || "D:/TheCode/WorkingProjects/ZeroAmpMusic/public/music";

// Create an HTML5 Audio object for music playback
const audio = new Audio();
let playlist = [];
let currentIndex = 0;

// Helper function to format file paths correctly
const formatFilePath = (filePath) => {
  try {
    const formattedPath = `file://${filePath.replace(/\\/g, "/")}`; // Fix path formatting
    console.log(`Formatted file path: ${formattedPath}`);
    return formattedPath;
  } catch (error) {
    console.error("Error formatting file path:", error);
    return filePath;
  }
};

// Function to play a specific song
const playSong = (filePath) => {
  try {
    const formattedPath = formatFilePath(filePath);
    console.log(`Attempting to play: ${formattedPath}`);
    audio.src = formattedPath;
    audio.play().then(() => {
      console.log(`Started playing: ${formattedPath}`);
    }).catch((error) => {
      console.error("Error starting playback:", error);
    });
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld("electron", {
  baseDir,

  // Dialog functionality
  dialog: {
    showOpenDialog: async (options) => {
      try {
        return await ipcRenderer.invoke("dialog:openFile", options);
      } catch (error) {
        console.error("Error showing dialog:", error);
        return { canceled: true, filePaths: [] };
      }
    },
  },

  // File system operations
  fileSystem: {
    copyFile: async (source, destination) => {
      try {
        return await ipcRenderer.invoke("fs:copyFile", { source, destination });
      } catch (error) {
        console.error("Error copying file:", error);
        return { success: false, error: error.message };
      }
    },
    readDirectory: async (dir) => {
      try {
        console.log(`Reading directory: ${dir}`);
        const result = await ipcRenderer.invoke("fs:readDirectory", dir);
        console.log(`Files in directory:`, result.files);
        return result;
      } catch (error) {
        console.error("Error reading directory:", error);
        return { success: false, files: [] };
      }
    },
    rename: async (oldPath, newPath) => {
      try {
        return await ipcRenderer.invoke("fs:rename", { oldPath, newPath });
      } catch (error) {
        console.error("Error renaming file:", error);
        return { success: false, error: error.message };
      }
    },
    delete: async (filePath) => {
      try {
        return await ipcRenderer.invoke("fs:delete", filePath);
      } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, error: error.message };
      }
    },
  },

  // Audio playback functionality
  audio: {
    play: (filePath) => {
      try {
        if (filePath) {
          playSong(filePath);
        } else if (audio.src) {  // 🔹 If a song is already loaded, resume playback
          audio.play();
          console.log("Resumed playback of:", audio.src);
        }
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    },
    pause: () => {
      try {
        if (!audio.paused) {
          audio.pause();
          console.log("Audio paused at:", audio.currentTime);
        }
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    },
    resume: () => {
      try {
        audio.play(); // Resume from paused position
        console.log("Audio resumed from:", audio.currentTime);
      } catch (error) {
        console.error("Error resuming audio:", error);
      }
    },
    stop: () => {
      try {
        audio.pause();
        audio.currentTime = 0; // Reset to beginning
        console.log("Audio stopped");
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    },
    setVolume: (volume) => {
      try {
        audio.volume = volume / 100;
        console.log(`Volume set to: ${volume}`);
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    },
    isPaused: () => audio.paused,
  },
});