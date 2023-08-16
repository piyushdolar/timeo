const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('reportPreload', {
	history: (date) => ipcRenderer.invoke('history-logs', date),
})