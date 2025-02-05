const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

// Quit if running Electron Squirrel startup
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Suppress Autofill-related warnings
app.commandLine.appendSwitch("disable-features", "AutofillServerCommunication");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 500,
    resizable: false,
    maximizable: false,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false, // For better security
      webSecurity: false, // Allows local resource loading
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, // Preload script setup
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY); // Load Webpack entry

  // Uncomment below to open DevTools only during debugging
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // Recreate a window if none are open (macOS behavior)
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Quit the app if all windows are closed, except on macOS
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ✅ IPC handler for opening the file dialog
ipcMain.handle("dialog:openFile", async () => {
  try {
    const result = await dialog.showOpenDialog({
      filters: [{ name: "Audio Files", extensions: ["mp3", "wav"] }],
      properties: ["openFile", "multiSelections"],
    });
    console.log("Dialog result:", result);
    return result; // Return selected files to the renderer
  } catch (error) {
    console.error("Error opening dialog:", error);
    return { canceled: true };
  }
});

// ✅ IPC handler for copying files (Add to Playlist)
ipcMain.handle("fs:copyFile", async (_, { source, destination }) => {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ File copied from ${source} to ${destination}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error copying file:", error);
    return { success: false, error: error.message };
  }
});

// ✅ IPC handler for reading directory contents
ipcMain.handle("fs:readDirectory", async (_, dir) => {
  try {
    const directoryPath = path.resolve(dir);
    console.log(`📂 Reading directory: ${directoryPath}`);
    const files = fs.readdirSync(directoryPath).map((file) => file.trim());
    return { success: true, files };
  } catch (error) {
    console.error("❌ Error reading directory:", error);
    return { success: false, error: error.message };
  }
});

// ✅ IPC handler for deleting files
ipcMain.handle("fs:delete", async (_, filePath) => {
  try {
    const resolvedPath = path.resolve(filePath);
    console.log(`🗑️ Deleting file: ${resolvedPath}`);
    fs.unlinkSync(resolvedPath);
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    return { success: false, error: error.message };
  }
});

// ✅ IPC handler for renaming files
ipcMain.handle("fs:rename", async (_, { oldPath, newPath }) => {
  try {
    const resolvedOldPath = path.resolve(oldPath);
    const resolvedNewPath = path.resolve(newPath);
    console.log(`✏️ Renaming file: ${resolvedOldPath} ➝ ${resolvedNewPath}`);
    fs.renameSync(resolvedOldPath, resolvedNewPath);
    return { success: true };
  } catch (error) {
    console.error("❌ Error renaming file:", error);
    return { success: false, error: error.message };
  }
});

// ✅ IPC listener for when a song finishes playing
ipcMain.on("audio:ended", (event) => {
  console.log("🎵 Main process received audio:ended, playing next song...");
  event.sender.send("play-next-song");
});