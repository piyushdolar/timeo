// THIS SCRIPT ONLY RUNS ON SERVER SIDE.

// For windows
// if (require('electron-squirrel-startup')) app.quit();

// Auto update the app
require('update-electron-app')({
	repo: 'piyushdolar/timeo',
	updateInterval: '5 minutes',
	notifyUser: true
})

// Import electron
const { app, BrowserWindow, ipcMain, nativeImage, Notification, powerMonitor } = require('electron')
const path = require('path')

// Log
const { Log } = require('./log')
const log = new Log()
const moment = require('moment')

// If development environment
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
		hardResetMethod: 'exit'
	});
}

// Window - create for system
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
	})
	await win.loadFile('index.html')

	// First time opening send logs
	win.webContents.send('activity', await log.read())

	// Screen - lock
	powerMonitor.on('lock-screen', async (v) => {
		await log.write(
			'System logout',
			moment()
		)
		win.webContents.send('activity', await log.read())
	})
	// Screen - unlock
	powerMonitor.on('unlock-screen', async (v) => {
		await log.write(
			'System login',
			moment()
		)
		win.webContents.send('activity', await log.read())
	})

	// Screen - shutdown
	powerMonitor.on('shutdown', async (v) => {
		await log.write(
			'System shutdown',
			moment()
		)
		win.webContents.send('activity', await log.read())
	})

	// open devtools
	if (env === 'development') {
		// win.webContents.openDevTools()
	}
}

// Window - is ready
app.whenReady().then(() => {
	// Invoke: Read log from file
	// ipcMain.handle('activity', async () => {
	// 	const logs = await log.read()
	// 	return logs
	// })

	// Set Dock Image
	const image = nativeImage.createFromPath('./assets/images/timer.png')
	app.dock.setIcon(image)

	// Call notification
	new Notification({
		title: 'Hi there!',
		body: 'Your software is up to date!'
	}).show()

	// Mac: Activate window again on closed.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
}).then(createWindow)


// Window - On Close
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})