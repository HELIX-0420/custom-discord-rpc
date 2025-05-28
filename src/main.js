const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const RPC = require('discord-rpc');
const fetch = require('node-fetch');

let rpc = null;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 620,
    icon: path.join(__dirname, 'icon.ico'),
    resizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.removeMenu();
  mainWindow.loadFile('src/index.html');
}

let tray = null;

function createTray() {
  tray = new Tray(path.join(__dirname, '../icon.ico'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setToolTip('Custom Discord RPC');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show(); // show app on tray icon click
  });
}

ipcMain.on('connect-rpc', async (event, data) => {
  const clientId = data.appId?.trim();
  if (!clientId) return;

  if (rpc) {
    try {
      await rpc.clearActivity();
      await rpc.destroy();
    } catch {}
  }

  rpc = new RPC.Client({ transport: 'ipc' });

  rpc.on('ready', () => {
    console.log("🧪 Raw Min:", data.minPlayers, typeof data.minPlayers);
    console.log("🧪 Raw Max:", data.maxPlayers, typeof data.maxPlayers);

    let partySize;
    try {
      const min = parseInt(data.minPlayers);
      const max = parseInt(data.maxPlayers);

      console.log("✅ Parsed Min:", min, typeof min);
      console.log("✅ Parsed Max:", max, typeof max);

      if (
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        min > 0 &&
        max >= min
      ) {
        partySize = [min, max];
      }
    } catch (e) {
      console.warn("⚠️ Invalid partySize input:", data.minPlayers, data.maxPlayers);
      partySize = undefined;
    }

    const activity = {
      details: data.line1 || undefined,
      state: data.line2 || undefined,
      largeImageKey: data.bigImage || undefined,
      smallImageKey: data.smallImage || undefined,
      startTimestamp: ['none', 'local'].includes(data.timestamp) ? Date.now() : undefined,
      party: partySize ? {
        id: `party-${Date.now()}`,
        size: partySize
      } : undefined,
      ...((data.buttons && data.buttons.length > 0) ? {
        buttons: data.buttons.filter(btn => btn.label && btn.url)
      } : {})
    };

    console.log("🚀 Final Activity Payload:", activity);
    setTimeout(() => rpc.setActivity(activity), 300);
  });

  try {
    await rpc.login({ clientId });
  } catch (err) {
    console.error("RPC login failed:", err);
  }
});

ipcMain.on('disconnect-rpc', async () => {
  if (rpc) {
    try {
      await rpc.clearActivity();
      await rpc.destroy();
      rpc = null;
    } catch {}
  }
});

autoUpdater.autoDownload = false;

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});
autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('update-progress', progress);
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-ready');
});
autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('update-error', error.message || error);
});

ipcMain.on('start-update-download', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('restart-to-update', () => {
  const flagPath = path.join(app.getPath("userData"), "update-pending.txt");
  fs.writeFileSync(flagPath, "true");
  app.quit();
});

app.whenReady().then(() => {
  const flagPath = path.join(app.getPath("userData"), "update-pending.txt");
  if (fs.existsSync(flagPath)) {
    fs.unlinkSync(flagPath);
    autoUpdater.quitAndInstall(true, true);
    return;
  }

  createWindow();
  createTray();
  autoUpdater.checkForUpdates();
});
