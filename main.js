// --------------------------------------------
// THIS SCRIPT ONLY RUNS ON SERVER SIDE.
// --------------------------------------------

// Import electron
const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, powerMonitor, nativeImage, autoUpdater, dialog, shell } = require('electron')
const path = require('path')
const package = require('./package.json')
const imageManager = require('./image');

// Disable hardware acceleration
// app.disableHardwareAcceleration();

// --------------------------------------------
// LOGS Setup
// --------------------------------------------
const { Log } = require('./log')
const log = new Log(app.getPath('logs'))
const moment = require('moment')

/* ----------------------------------------------------
	WINDOWS
	Run this as early in the main process as possible
----------------------------------------------------- */
if (require('electron-squirrel-startup')) app.quit();

// --------------------------------------------
// Setup development env
// --------------------------------------------
const env = process.env.NODE_ENV || 'production';
let devtool = false
if (env === 'development') {
	devtool = true // open devtool
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
		hardResetMethod: 'exit'
	});
}

// --------------------------------------------
// Auto update the app
// --------------------------------------------
if (env !== 'development') {
	const server = 'https://update.electronjs.org'
	const url = `${server}/${package.author}/${package.name}/${process.platform}-${process.arch}/${app.getVersion()}`
	autoUpdater.setFeedURL({ url })
	setInterval(() => {
		autoUpdater.checkForUpdates()
	}, (60 * 1000)) // check for 60 seconds/1 minutes
	autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
		const dialogOpts = {
			type: 'info',
			buttons: ['Restart', 'Later'],
			title: 'Application Update',
			message: process.platform === 'win32' ? releaseNotes : releaseName,
			detail: 'A new version has been downloaded. Restart the application to apply the updates.'
		}

		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			if (returnValue.response === 0) {
				app.isQuiting = true
				autoUpdater.quitAndInstall()
			}
		})
	})
	autoUpdater.on('error', (message) => {
		console.error('There was a problem updating the application')
		console.error(message)
	})
}

/* ---------------------------------------------
	WINDOW - Main window
	index.html, renderer.js, preload.js,
---------------------------------------------- */
let tray;
const defaultWindowSetting = {
	width: env === 'development' ? 800 : 500,
	height: 625,
	webPreferences: {
		devTools: devtool,
		preload: path.join(__dirname, 'preload.js'),
		nodeIntegration: true,
	},
	center: true,
	resizable: env === 'development' ? true : false, // true dev
	maximizable: env === 'development' ? true : false, // true dev
	fullscreenable: env === 'development' ? true : false, // true dev
	icon: path.join(__dirname, './assets/images/icon.ico'),
	autoHideMenuBar: true //use alt/option to show
}

async function createWindow() {
	const win = await new BrowserWindow(defaultWindowSetting)
	await win.loadFile('index.html')

	// On minimize
	win.on('minimize', function (event) {
		event.preventDefault();
		win.hide();
	});

	// On close
	win.on('close', function (event) {
		if (!app.isQuiting && process.platform === 'win32') {
			event.preventDefault();
			win.hide();
		}
		return false;
	});

	// Screen - lock
	powerMonitor.on('lock-screen', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.create('System locked')))
	})

	// Screen - unlock
	powerMonitor.on('unlock-screen', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.create('System unlocked')))
	})

	// Screen - shutdown
	powerMonitor.on('shutdown', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.create('System shutdown')))
	})

	// Call notification
	ipcMain.on('send-notification', async (event, object) => {
		const notification = new Notification({
			title: object.title,
			body: object.body
		})

		// Show notification
		notification.show();

		// Listen for the click event on the notification
		notification.on('click', () => {
			notification.close();
		});
	})

	// Set Custom Log
	ipcMain.on('set-log', async (event, eventType) => {
		win.webContents.send('activity-read-logs', JSON.stringify(
			await log.create(eventType)
		))
	})

	// Set Config
	ipcMain.on('config', async (event, cfg) => {
		// Update today time if time is being set
		if (cfg.name === 'manual-time') {
			await log.config({
				name: 'today',
				value: moment().format('YYYY-MM-DD HH:mm:ss')
			})
		}
		await log.config(cfg)
	})

	// Open external link
	ipcMain.on('open-external-link', async (event, link) => {
		await shell.openExternal(link);
	})

	// Open folder
	ipcMain.on('open-logs-folder', async () => {
		await shell.showItemInFolder(app.getPath('logs'));
	})

	// Get Process
	ipcMain.handle('get-process-info', async () => {
		return {
			// crash: process.crash(),
			// hang: process.hang(),
			getCreationTime: process.getCreationTime(),
			// getHeapStatistics: process.getHeapStatistics(),
			// getBlinkMemoryInfo: process.getBlinkMemoryInfo(),
			getProcessMemoryInfo: await process.getProcessMemoryInfo(),
			getSystemMemoryInfo: process.getSystemMemoryInfo(),
			getSystemVersion: process.getSystemVersion(),
			getCPUUsage: process.getCPUUsage(),
			// getIOCounters: process.getIOCounters(),
			uptime: process.uptime(),
			// argv: process.argv,
			// execPath: process.execPath,
			// env: process.env,
			pid: process.pid,
			arch: process.arch,
			platform: process.platform,
			// sandboxed: process.sandboxed,
			// contextIsolated: process.contextIsolated,
			type: process.type,
			version: process.version,
			versions: process.versions,
			// mas: process.mas,
			// windowsStore: process.windowsStore,
			// contextId: process.contextId,
		}
	})

	// Get Image
	ipcMain.on("get-background-image", async () => {
		try {
			const imagePath = await imageManager.getBackgroundImage();
			if (imagePath) {
				win.webContents.send('background-image', imagePath);
			}
		} catch (error) {
			console.error('Error getting background image:', error);
		}
	});

	// Upload image
	ipcMain.on('change-background-image', async (event, image) => {
		imageManager.changeBackgroundImage(event, image);
	});

	// Set BG Image by URL
	ipcMain.on('change-background-image-by-url', async (event, url) => {
		imageManager.changeBackgroundImageByUrl(event, url);
	});

	// Delete background image
	ipcMain.on('delete-background-image', async (event) => {
		imageManager.deleteBackgroundImage(event);
	});

	// open devtools
	if (devtool) {
		win.webContents.openDevTools()
	}

	return win
}

/* ---------------------------------------------------
	WINDOW - Ready
	When all windows are ready invoke it
---------------------------------------------------- */
app.whenReady().then(async () => {
	// Invoke: First time read log from file
	ipcMain.handle('activity-logs', async () => await log.history())

	// Invoke: History logs
	ipcMain.handle('history-logs', async (event, date) => await log.history(date))

	// Get Config
	ipcMain.handle('get-config', async () => await log.config())

	// Set Dock Image
	if (process.platform === 'darwin') app.dock.setIcon(nativeImage.createFromPath('./assets/images/icon.png'))

	// Create window
	const win = await createWindow()

	// Create Tray Icon
	const trayIconPath = path.join(__dirname, './assets/images/iconTemplate.png')
	tray = new Tray(nativeImage.createFromPath(trayIconPath))
	tray.setToolTip('Timeo');
	const trayContextMenu = Menu.buildFromTemplate([
		{
			label: 'Open Timeo',
			click: () => win.show()
		},
		{
			label: 'About',
			role: 'about'
		},
		{
			label: 'Quit',
			click: () => {
				app.isQuiting = true
				app.quit()
			}
		},
	])
	tray.setContextMenu(trayContextMenu)

	// On Tray icon click
	tray.on('click', async () => {
		win.show()
	})

	// Mac: Activate window again on closed.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
		// win.show()
	})
})

/* ---------------------------------------------------
	WINDOW - Minimize window
	Minimize window when clicked on close
---------------------------------------------------- */
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
})