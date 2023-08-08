// Test function
const test = async () => {
	const response = await preload.ping()
	console.log(preload)
}
test()

// Internet connection status
let connectionStatus = document.getElementById('i-connection-status')
if (navigator.onLine) {
	connectionStatus.classList.add("text-success");
	connectionStatus.innerHTML = 'Stable'
} else {
	connectionStatus.classList.add("text-danger");
	connectionStatus.innerHTML = 'Unstable'
}

// Version tag
let versionTag = document.getElementById('version-tag')
const firstLetter = preload.name.charAt(0)
const firstLetterCap = firstLetter.toUpperCase()
const remainingLetters = preload.name.slice(1)
const capitalizedWord = firstLetterCap + remainingLetters

versionTag.innerHTML = capitalizedWord + ' v' + preload.version