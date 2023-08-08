// Test function
const test = async () => {
	const response = await window.versions.ping()
	console.log(response) // prints out 'pong'
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