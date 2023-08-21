// --------------------------------------------
// THIS SCRIPT ONLY RUNS ON SERVER SIDE.
// --------------------------------------------

// Import electron
const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, powerMonitor, nativeImage, autoUpdater, dialog } = require('electron')
const path = require('path')
const package = require('./package.json')

// --------------------------------------------
// LOGS Setup
// --------------------------------------------
const { Log } = require('./log')
const log = new Log()
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
	}, 60000)
	autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
		const dialogOpts = {
			type: 'info',
			buttons: ['Restart', 'Later'],
			title: 'Application Update',
			message: process.platform === 'win32' ? releaseNotes : releaseName,
			detail: 'A new version has been downloaded. Restart the application to apply the updates, please manually quit from tray icon.'
		}

		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			console.log(returnValue)
			if (returnValue.response === 0) autoUpdater.quitAndInstall()
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

	// Tray Icon
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

	// On minimize
	win.on('minimize', function (event) {
		event.preventDefault();
		win.hide();
	});

	// On close
	win.on('close', function (event) {
		if (!app.isQuiting) {
			event.preventDefault();
			win.hide();
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
	ipcMain.on('set-cookie', async (event, biscuit) => {
		if (biscuit.name === 'manual-time') {
			await log.config({
				name: 'today',
				value: moment().format('YYYY-MM-DD HH:mm:ss')
			})
		}
		await log.config(biscuit)
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
		const today = moment(cookie.today, 'YYYY-MM-DD HH:mm:ss')
		if (today.isSame(moment(), 'day')) win.webContents.send('set-check-in', cookie['manual-time'])
		// Check in for first time
		else {
			const timeNow = moment();
			const beforeTime = moment('07:55 am', 'hh:mm a');
			const afterTime = moment('08:30 am', 'hh:mm a');
			if (timeNow.isBetween(beforeTime, afterTime)) {
				win.webContents.send('set-check-in', timeNow.format('hh:mm:ss a'))
			}
		}
	}

	// Mac: Activate window again on closed.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
		win.show()
	})
})


/* ---------------------------------------------------
	WINDOW - Report window
	report.html, report.js, report-preload.js
---------------------------------------------------- */
// ipcMain.handle('open-report-window', async () => {
// 	const reportWindow = new BrowserWindow(defaultWindowSetting);

// 	const filePath = path.join(__dirname, 'report.html');
// 	reportWindow.loadFile(filePath);

// 	// open devtools
// 	if (devtool) {
// 		reportWindow.webContents.openDevTools()
// 	}
// })


/* ---------------------------------------------------
	WINDOW - Minimize window
	Minimize window when clicked on close
---------------------------------------------------- */
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
})