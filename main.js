// THIS SCRIPT ONLY RUNS ON SERVER SIDE.
// Import electron
const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, powerMonitor, nativeImage } = require('electron')
const path = require('path')

// Log
const { Log } = require('./log')
const log = new Log()
const moment = require('moment')

// For windows
// run this as early in the main process as possible
if (require('electron-squirrel-startup')) app.quit();

// Auto update the app
require('update-electron-app')({
	repo: 'piyushdolar/timeo',
	updateInterval: '5 minutes',
	notifyUser: true
})

// If development environment
const env = process.env.NODE_ENV || 'production';
let devtool = false
if (env === 'development') {
	devtool = false // open devtool
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
		hardResetMethod: 'exit'
	});
}

// Dock image initialize
let tray = null
let isQuiting;
const icon = nativeImage.createFromPath('./assets/images/icon.png')

/* ---------------------------------------------
	WINDOW - Main window
	index.html, renderer.js, preload.js,
---------------------------------------------- */
async function createWindow() {
	const win = await new BrowserWindow({
		width: 600, // 1000 dev
		height: 625, // 800 dev
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true
		},
		center: true,
		resizable: env === 'development' ? true : false, // true dev
		maximizable: env === 'development' ? true : false, // true dev
		fullscreenable: env === 'development' ? true : false, // true dev
		icon: icon
	})
	await win.loadFile('index.html')

	// Tray Icon
	tray = new Tray(nativeImage.createFromPath('./assets/images/icon-tray.png'))
	const trayContextMenu = Menu.buildFromTemplate([
		{
			label: 'Show App',
			click: () => win.show()
		},
		{
			label: 'Quit', click: () => {
				app.isQuiting = true
				app.quit()
			}
		}
	])
	tray.setContextMenu(trayContextMenu)

	// On minimize
	win.on('minimize', function (event) {
		event.preventDefault();
		win.hide();
	});

	// On close
	win.on('close', function (event) {
		if (!win.isQuiting && process.platform === 'win32') {
			event.preventDefault();
			win.hide();
		}
		return false;
	});

	// Screen - lock
	powerMonitor.on('lock-screen', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.write(
			'System logout',
			moment()
		)))
	})
	// Screen - unlock
	powerMonitor.on('unlock-screen', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.write(
			'System login',
			moment()
		)))

		// Check in for first time
		const timeNow = moment();
		const beforeTime = moment('07:55 am', 'hh:mm a');
		const afterTime = moment('08:30 am', 'hh:mm a');
		if (timeNow.isBetween(beforeTime, afterTime)) {
			win.webContents.send('first-time-check-in', true)
		}
	})

	// Screen - shutdown
	powerMonitor.on('shutdown', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.write(
			'System shutdown',
			moment()
		)))
	})

	// Call notification
	ipcMain.on('send-notification', async (event, object) => {
		new Notification({
			title: object.title,
			body: object.body
		}).show()
	})

	// Set Custom Log
	ipcMain.on('set-log', async (event, eventType) => {
		win.webContents.send('activity-read-logs', JSON.stringify(
			await log.write(eventType, moment())
		))
	})

	// open devtools
	if (devtool) {
		win.webContents.openDevTools()
	}
}



/* ---------------------------------------------------
	WINDOW - Ready
	When all windows are ready invoke it
---------------------------------------------------- */
app.whenReady().then(() => {
	// Invoke: First time read log from file
	ipcMain.handle('activity-logs', async () => await log.read())

	// Invoke: History logs
	ipcMain.handle('history-logs', async (event, date) => {
		return await log.history(date)
	})

	// Set Dock Image
	if (process.platform === 'darwin') app.dock.setIcon(icon)

	// Create window
	createWindow()

	// Mac: Activate window again on closed.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})


/* ---------------------------------------------------
	WINDOW - Report window
	report.html, report.js, report-preload.js
---------------------------------------------------- */
ipcMain.handle('open-report-window', async () => {
	const reportWindow = new BrowserWindow({
		width: 600, // 1000 dev
		height: 625, // 800 dev
		webPreferences: {
			preload: path.join(__dirname, 'report-preload.js'),
			nodeIntegration: true
		},
		center: true,
		resizable: env === 'development' ? true : false, // true dev
		maximizable: env === 'development' ? true : false, // true dev
		fullscreenable: env === 'development' ? true : false, // true dev
	});

	const filePath = path.join(__dirname, 'report.html');
	reportWindow.loadFile(filePath);

	// open devtools
	if (devtool) {
		reportWindow.webContents.openDevTools()
	}
})


/* ---------------------------------------------------
	WINDOW - Minimize window
	Minimize window when clicked on close
---------------------------------------------------- */
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})