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

// IPC handler for opening the file dialog
ipcMain.handle("dialog:openFile", async (_, options) => {
  try {
    console.log("Opening dialog with options:", options);
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), options);
    console.log("Dialog result:", result);
    return result; // Return the selected files
  } catch (error) {
    console.error("Error opening dialog:", error);
    return { success: false, error: error.message };
  }
});

// IPC handler for copying files
ipcMain.handle("fs:copyFile", async (_, { source, destination }) => {
  try {
    fs.copyFileSync(source, destination);
    console.log(`File copied from ${source} to ${destination}`);
    return { success: true };
  } catch (error) {
    console.error("Error copying file:", error);
    return { success: false, error: error.message };
  }
});

// IPC handler for reading directory contents
ipcMain.handle("fs:readDirectory", async (_, dir) => {
  try {
    const files = fs.readdirSync(path.resolve(dir)).map((file) => file.trim());
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for deleting files
ipcMain.handle("fs:delete", async (_, filePath) => { // Match "fs:delete"
  try {
    fs.unlinkSync(path.resolve(filePath)); // Delete the file
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for renaming files
ipcMain.handle("fs:rename", async (_, { oldPath, newPath }) => { // Match "fs:rename"
  try {
    fs.renameSync(path.resolve(oldPath), path.resolve(newPath)); // Rename the file
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});