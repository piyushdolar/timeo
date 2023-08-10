if (require('electron-squirrel-startup')) app.quit();

// Auto update the app
require('update-electron-app')({
	repo: 'piyushdolar/timeo',
	updateInterval: '1 hour',
})

// Import electron
const { app, BrowserWindow, ipcMain, nativeImage, Notification } = require('electron')
const path = require('path')

// If development environment
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
		hardResetMethod: 'exit'
	});
}

function createWindow() {
	const win = new BrowserWindow({
		width: 400,
		height: 400,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true
		},
		center: true,
		resizable: true,
		maximizable: true,
		fullscreenable: true,
	})
	win.loadFile('index.html')

	// open devtools
	win.webContents.openDevTools()
}

// App launch
app.whenReady().then(() => {
	// Set Dock Image
	const image = nativeImage.createFromPath('./assets/images/timer.png')
	app.dock.setIcon(image)

	// Handle test function
	ipcMain.handle('pingTome', () => 'pong')

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


// On Close
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})