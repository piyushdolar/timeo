const { contextBridge, ipcRenderer } = require('electron')
const package = require('./package.json')
// const moment = require('moment')

// Expose to renderer.js file
contextBridge.exposeInMainWorld('preload', {
	name: package.name,
	version: package.version,
	activity: () => ipcRenderer.invoke('activity-logs'),
	// openReportWindow: () => ipcRenderer.invoke('open-report-window'),
	history: (date) => ipcRenderer.invoke('history-logs', date), // for report.js file
	listenActivity: (callback) => ipcRenderer.on('activity-read-logs', callback),
	listenSetTime: (callback) => ipcRenderer.on('set-check-in', callback),
	notification: (title, body) => ipcRenderer.send('send-notification', { title, body }),
	log: (eventType) => ipcRenderer.send('set-log', eventType),
	config: (name, value) => ipcRenderer.send('config', { name, value }),
	getConfig: () => ipcRenderer.invoke('get-config'),
	cookie: (name, value) => ipcRenderer.send('cookie', { name, value }),
	openExternalLink: (link) => ipcRenderer.send('open-external-link', link),

	// settings.js
	openLogsFolder: () => ipcRenderer.send('open-logs-folder'),
	getProcessInfo: () => ipcRenderer.invoke('get-process-info'),
	changeBackground: (image) => ipcRenderer.send('change-background-image', image),
	deleteBackground: () => ipcRenderer.send('delete-background-image'),
	changeBackgroundByURL: (url) => ipcRenderer.send('change-background-image-by-url', url),
})

// Update to HTML element
window.addEventListener('DOMContentLoaded', () => {
	ipcRenderer.send('get-background-image')

	// Listen custom bg image has already or not
	ipcRenderer.on('background-image', (event, image) => {
		const body = document.body
		body.style.backgroundImage = `url('file://${image}')`;
	});

	// Deleted bg image listen
	ipcRenderer.on('deleted-background-image', (event, response) => {
		if (response.success) {
			location.reload()
		}
	});

	ipcRenderer.on('image-download-complete', (event, response) => {
		if (response.success) {
			location.reload()
		}
	});
})