// --------------------------------------------
// Open Logs Folder
// --------------------------------------------
const openLogsFolder = document.getElementById("open-logs-folder");
openLogsFolder.addEventListener("click", () => {
	window.preload.openLogsFolder()
})

// Default loading things
function getProcessInfo() {
	new Promise((resolve, reject) => {
		try {
			resolve(preload.getProcessInfo())
		} catch (error) {
			reject(error)
		}
	}).then(async processInfo => {
		for (const key in processInfo) {
			const element = document.getElementById(key)
			if (element !== null) {
				if (key === 'uptime') {
					element.textContent = parseFloat(processInfo[key] / 60).toFixed(2) + ' Minutes'
				} else if (key === 'getCreationTime') {
					const creationTime = new Date(processInfo[key]).toLocaleString()
					element.textContent = creationTime
				} else if (key === 'getCPUUsage') {
					const cpuInfo = processInfo[key].percentCPUUsage
					element.textContent = cpuInfo.toFixed(2) + '%'
				} else if (key === 'getProcessMemoryInfo') {
					const memoryInfo = processInfo[key].private / 1024
					element.textContent = memoryInfo.toFixed(2) + ' MB'
				} else {
					element.textContent = processInfo[key]
				}
			}
		}

	}).catch(error => console.warn('Loading error', error))
}

setInterval(() => {
	getProcessInfo()
}, 1000)

// Image upload
// Get references to the button and file input
const imageUploadInput = document.getElementById('bg-file');
imageUploadInput.addEventListener('change', (event) => {
	const file = event.target.files[0];
	if (file) {
		preload.changeBackground(file.path);
	}
});

// Image URL Upload
const imageUploadLink = document.getElementById('image-upload-link');
const bgFileButtonLink = document.getElementById('bg-file-btn-link');
bgFileButtonLink.addEventListener('click', function () {
	preload.changeBackgroundByURL(imageUploadLink.value)
});


// Delete image
const deleteButton = document.getElementById('bg-file-delete');
deleteButton.addEventListener('click', function () {
	preload.deleteBackground()
});