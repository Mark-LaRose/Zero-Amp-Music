const { contextBridge, ipcRenderer } = require("electron");
const path = require("path-browserify");

// Define the direct file path to the 'music' directory
const baseDir = "D:/TheCode/WorkingProjects/ZeroAmpMusic/public/music";

// Create an HTML5 Audio object for music playback
const audio = new Audio();

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

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld("electron", {
  // Expose the base directory path
  baseDir,

  // Dialog functionality
  dialog: {
    showOpenDialog: (options) => ipcRenderer.invoke("dialog:openFile", options),
  },

  // File system operations
  fileSystem: {
    copyFile: (source, destination) =>
      ipcRenderer.invoke("fs:copyFile", { source, destination }),
    readDirectory: async (dir) => {
      try {
        const files = await ipcRenderer.invoke("fs:readDirectory", dir);
        return files;
      } catch (error) {
        console.error("Error reading directory:", error);
        return []; // Fallback to an empty array on error
      }
    },
  },

  // Audio playback functionality
  audio: {
    play: (filePath) => {
      try {
        const formattedPath = formatFilePath(filePath); // Format the path
        console.log(`Attempting to play: ${formattedPath}`);
        audio.src = formattedPath;
        audio.play()
          .then(() => {
            console.log(`Started playing: ${formattedPath}`);
          })
          .catch((error) => {
            console.error("Error starting playback:", error);
          });
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    },
    pause: () => {
      try {
        audio.pause();
        console.log("Audio paused");
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    },
    stop: () => {
      try {
        audio.pause();
        audio.currentTime = 0;
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
    isPlaying: () => !audio.paused,
  },

  // Enhanced error handling for audio events
  audioEvents: {
    attachErrorLogger: () => {
      audio.onerror = () => {
        console.error("Audio playback error", audio.error);
        switch (audio.error.code) {
          case audio.error.MEDIA_ERR_ABORTED:
            console.error("Playback was aborted.");
            break;
          case audio.error.MEDIA_ERR_NETWORK:
            console.error("A network error occurred.");
            break;
          case audio.error.MEDIA_ERR_DECODE:
            console.error("Audio decoding failed.");
            break;
          case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            console.error("Audio source not supported.");
            break;
          default:
            console.error("An unknown error occurred.");
        }
      };
    },
  },
});