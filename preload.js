const { contextBridge, ipcRenderer } = require('electron')
const package = require('./package.json')

// Test function
contextBridge.exposeInMainWorld('preload', {
	ping: () => ipcRenderer.invoke('pingTome'),
	name: package.name,
	version: package.version,
})

// Footer text
// window.addEventListener('DOMContentLoaded', () => {
// 	const replaceText = (selector, text) => {
// 		const element = document.getElementById(selector)
// 		if (element) element.innerText = text
// 	}
// 	for (const dependency of ['chrome', 'node', 'electron']) {
// 		replaceText(`${dependency}-version`, process.versions[dependency])
// 	}
// })