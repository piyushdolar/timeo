const { contextBridge, ipcRenderer } = require('electron')
const package = require('./package.json')
// const moment = require('moment')

// Expose to renderer.js file
contextBridge.exposeInMainWorld('preload', {
	name: package.name,
	version: package.version,
	activity: () => ipcRenderer.invoke('activity-logs'),
	openReportWindow: () => ipcRenderer.invoke('open-report-window'),
	history: (date) => ipcRenderer.invoke('history-logs', date), // for report.js file
	listenActivity: (callback) => ipcRenderer.on('activity-read-logs', callback),
	listenFirstTimeCheckIn: (callback) => ipcRenderer.on('first-time-check-in', callback),
	notification: (title, body) => ipcRenderer.send('send-notification', { title, body }),
	log: (eventType) => ipcRenderer.send('set-log', eventType),
})

// Update to HTML element
window.addEventListener('DOMContentLoaded', () => {
	// Another way to read the logs
	// ipcRenderer.on('activity', (_event, logs) => {
	// 	setLogs(logs)
	// })
})