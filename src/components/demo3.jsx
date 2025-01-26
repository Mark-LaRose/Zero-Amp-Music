const { contextBridge, ipcRenderer } = require("electron");
const path = require("path-browserify");

// Define the direct file path to the 'music' directory
const baseDir = "D:/The Code/Working Projects/ZeroAmp Music/public/music";

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
});