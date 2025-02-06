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
      enableRemoteModule: false,
      webSecurity: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Uncomment below to open DevTools only during debugging
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handler for opening the file dialog
ipcMain.handle("dialog:openFile", async () => {
  try {
    const result = await dialog.showOpenDialog({
      filters: [{ name: "Audio Files", extensions: ["mp3", "wav"] }],
      properties: ["openFile", "multiSelections"],
    });
    return result;
  } catch (error) {
    return { canceled: true };
  }
});

// IPC handler for copying files
ipcMain.handle("fs:copyFile", async (_, { source, destination }) => {
  try {
    fs.copyFileSync(source, destination);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for reading directory contents
ipcMain.handle("fs:readDirectory", async (_, dir) => {
  try {
    const directoryPath = path.resolve(dir);
    const files = fs.readdirSync(directoryPath).map((file) => file.trim());
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for deleting files
ipcMain.handle("fs:delete", async (_, filePath) => {
  try {
    const resolvedPath = path.resolve(filePath);
    fs.unlinkSync(resolvedPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for renaming files
ipcMain.handle("fs:rename", async (_, { oldPath, newPath }) => {
  try {
    const resolvedOldPath = path.resolve(oldPath);
    const resolvedNewPath = path.resolve(newPath);
    fs.renameSync(resolvedOldPath, resolvedNewPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC listener for when a song finishes playing
ipcMain.on("audio:ended", (event) => {
  event.sender.send("play-next-song");
});