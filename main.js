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
	devtool = true // open devtool
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
		hardResetMethod: 'exit'
	});
}

// Dock image initialize
let tray;
let isQuiting;
const defaultWindowSetting = {
	width: 600, // 1000 dev
	height: 625, // 800 dev
	webPreferences: {
		devTools: devtool,
		preload: path.join(__dirname, 'preload.js'),
		nodeIntegration: true,
		partition: 'persist:timeo'
	},
	center: true,
	resizable: env === 'development' ? true : false, // true dev
	maximizable: env === 'development' ? true : false, // true dev
	fullscreenable: env === 'development' ? true : false, // true dev
	icon: path.join(__dirname, './assets/images/icon.ico'),
	autoHideMenuBar: true //use alt/option to show
}

/* ---------------------------------------------
	WINDOW - Main window
	index.html, renderer.js, preload.js,
---------------------------------------------- */
async function createWindow() {
	const win = await new BrowserWindow(defaultWindowSetting)
	await win.loadFile('index.html')

	// Tray Icon
	const trayIconPath = path.join(__dirname, './assets/images/iconTemplate.png')
	tray = new Tray(nativeImage.createFromPath(trayIconPath))
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
				isQuiting = true
				app.quit()
			}
		},
	])
	tray.setContextMenu(trayContextMenu)

	// On Tray icon click
	tray.on('click', async () => {
		win.show()
	})

	// On minimize
	win.on('minimize', function (event) {
		event.preventDefault();
		win.hide();
	});

	// On close
	win.on('close', function (event) {
		if (!isQuiting && process.platform === 'win32') {
			event.preventDefault();
			win.hide();
			event.returnValue = false;
		}
		return false;
	});

	// Screen - lock
	powerMonitor.on('lock-screen', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.write(
			'System locked',
			moment()
		)))
	})

	// Screen - unlock
	powerMonitor.on('unlock-screen', async () => {
		win.webContents.send('activity-read-logs', JSON.stringify(await log.write(
			'System unlocked',
			moment()
		)))

		// Check in for first time
		const timeNow = moment();
		const beforeTime = moment('07:55 am', 'hh:mm a');
		const afterTime = moment('08:30 am', 'hh:mm a');
		if (timeNow.isBetween(beforeTime, afterTime)) {
			win.webContents.send('set-check-in', timeNow)
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

	// Set Cookie
	ipcMain.on('set-cookie', (event, biscuit) => {
		log.config(biscuit)
	})

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
	ipcMain.handle('activity-logs', async () => await log.read())

	// Invoke: History logs
	ipcMain.handle('history-logs', async (event, date) => {
		return await log.history(date)
	})

	// Set Dock Image
	if (process.platform === 'darwin') app.dock.setIcon(nativeImage.createFromPath('./assets/images/icon.png'))

	// Create window
	const win = await createWindow()

	// Get Cookie
	const cookie = await log.config()
	if (cookie['manual-time']) {
		win.webContents.send('set-check-in', cookie['manual-time'])
	}

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
	const reportWindow = new BrowserWindow(defaultWindowSetting);

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