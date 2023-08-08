const { contextBridge, ipcRenderer } = require('electron')

// Test function
contextBridge.exposeInMainWorld('versions', {
	ping: () => ipcRenderer.invoke('pingTome')
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