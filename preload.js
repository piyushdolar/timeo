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
	cookie: (name, value) => ipcRenderer.send('set-cookie', { name, value }),
	openExternalLink: (link) => ipcRenderer.send('open-external-link', link),
})

// Update to HTML element
window.addEventListener('DOMContentLoaded', () => {
	// Another way to read the logs
	// ipcRenderer.on('activity', (_event, logs) => {
	// 	setLogs(logs)
	// })
})