const { contextBridge, ipcRenderer } = require('electron')
const package = require('./package.json')
const moment = require('moment')

const setLogs = (logs) => {
	// Sort to the descending order by time
	logs.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))

	const logTableBody = document.getElementById('log-table-body')
	// Create a new row element for each row in the table data
	for (var i = 0; i < logs.length; i++) {
		let row = document.createElement("tr");
		// Create a new cell element for each column in the table data

		for (let j = 0; j < Object.keys(logs[i]).length; j++) {
			let cell = document.createElement("td");
			cellValue = logs[i][Object.keys(logs[i])[j]];
			if (Object.keys(logs[i])[j] === 'eventTime') {
				let checkDate = moment(logs[i][Object.keys(logs[i])[j]])
				cellValue = checkDate.isValid() ? moment(logs[i][Object.keys(logs[i])[j]]).format('hh:mm:ss a') : cellValue
			}
			cell.innerHTML = cellValue
			row.appendChild(cell);
		}
		logTableBody.appendChild(row);
	}
}

// Expose to renderer.js file
contextBridge.exposeInMainWorld('preload', {
	name: package.name,
	version: package.version,
	// activity: () => ipcRenderer.invoke('activity')
})

// Update to HTML element
window.addEventListener('DOMContentLoaded', () => {
	// Read logs
	ipcRenderer.on('activity', (_event, logs) => {
		setLogs(logs)
	})
})