// Initial loading
console.info(preload.name + ' v' + preload.version)

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
function capitalFirstLetter(name) {
	const firstLetter = name.charAt(0)
	const firstLetterCap = firstLetter.toUpperCase()
	const remainingLetters = preload.name.slice(1)
	return firstLetterCap + remainingLetters
}
let versionTag = document.getElementById('version-tag')
versionTag.innerHTML = capitalFirstLetter(preload.name) + ' v' + preload.version

// --------------------------------------------
// Countdown timer
// --------------------------------------------
// let startTime = moment('08:00:00 am', 'hh:mm:ss a');
let endTime = moment('05:00:00 pm', 'hh:mm:ss a');
const lunchTime = moment('11:55:00 am', 'h:mm:ss a');
const remainingTimeElement = document.getElementById('remaining-time');
let dateTime = document.getElementById('date-time')

function updateCountdownDisplay() {
	const flag = {
		notifyAtLunch: sessionStorage.getItem('flag_notifyAtLunch') !== 'false',
		notifyAt30: sessionStorage.getItem('flag_notifyAt30') !== 'false',
		notifyAt15: sessionStorage.getItem('flag_notifyAt15') !== 'false',
		notifyAt05: sessionStorage.getItem('flag_notifyAt05') !== 'false'
	}
	const currentTime = moment();
	const timeLeft = moment.duration(endTime.diff(currentTime));
	const formattedTime = `${timeLeft.hours()}h ${timeLeft.minutes()}m ${timeLeft.seconds()}s`;

	// Show clock
	dateTime.textContent = moment().format("dddd, MMMM Do YYYY, h:mm:ss a")

	// Notify for lunch time
	const timeToLunch = moment.duration(lunchTime.diff(currentTime));

	// Check and display alert for 11:55 AM for lunch time
	if (flag.notifyAtLunch && timeToLunch.asMilliseconds() <= 0) {
		window.preload.notification('Lunch time!', "5 minutes to go")
		sessionStorage.setItem('flag_notifyAtLunch', false)
	}

	// Check if there's 30 minutes left and display an alert
	if (flag.notifyAt30 && timeLeft.asMinutes() <= 30 && timeLeft.asMilliseconds() > 0) {
		window.preload.notification('Reminder', '30 minutes left for checkout')
		sessionStorage.setItem('flag_notifyAt30', false)
	}

	// Check if there's 30 minutes left and display an alert
	if (flag.notifyAt15 && timeLeft.asMinutes() <= 15 && timeLeft.asMilliseconds() > 0) {
		window.preload.notification('Pack up', '15 minutes left for checkout')
		sessionStorage.setItem('flag_notifyAt15', false)
	}

	// Check if there's 30 minutes left and display an alert
	if (flag.notifyAt05 && timeLeft.asMinutes() <= 5 && timeLeft.asMilliseconds() > 0) {
		window.preload.notification('Leaving time', '5 minutes left for checkout')
		sessionStorage.setItem('flag_notifyAt05', false)
	}

	remainingTimeElement.textContent = timeLeft.asMilliseconds() < 0 ? 'OVERTIME!' : formattedTime;

	if (timeLeft.asMilliseconds() > 0) {
		requestAnimationFrame(updateCountdownDisplay);
	}
}

// Start the interval
setInterval(function () {
	updateCountdownDisplay()
}, 1000);

// --------------------------------------------
// Update custom time
// --------------------------------------------
const updateLeftButton = document.getElementById("update-left-button")
const updateInput = document.getElementById("update-input")
const updateAmPm = document.getElementById("update-am-pm")
let updateRightButton = document.getElementById("update-right-button");

// Update initial time
updateInput.value = moment().format('hh:mm:ss')
updateAmPm.value = moment().format('a')

// Click - on cancel/exit
function closeUpdateBox() {
	updateLeftButton.setAttribute('disabled', true)
	updateLeftButton.textContent = 'Check In'
	updateLeftButton.classList.remove('btn-danger')
	updateLeftButton.classList.remove('text-white')

	updateInput.setAttribute('disabled', true)
	updateAmPm.setAttribute('disabled', true)

	updateRightButton.textContent = 'Edit'
	updateRightButton.classList.remove('btn-primary')
	updateRightButton.classList.remove('text-white')
}

// Set custom time
async function setTime(manualTime = moment().format('hh:mm:ss a')) {
	const initialTime = moment(manualTime, 'hh:mm:ss a');

	// Check if saturday
	let totalHour = 9
	if (moment().day() === 6) totalHour = 4;

	// Calculate and set time for countdown
	const timeAfterTotalHours = initialTime.clone().add(totalHour, 'hours');
	endTime = timeAfterTotalHours

	// Clear alert flags
	flag.notifyAt30 = true
	flag.notifyAt15 = true
	flag.notifyAt05 = true
	flag.notifyAtLunch = true
}

// Click - on update button
updateRightButton.addEventListener("click", () => {
	// Edit input
	if (updateRightButton.textContent === 'Edit') {
		updateRightButton.textContent = 'Update'
		updateRightButton.classList.add('btn-primary')
		updateRightButton.classList.add('text-white')

		updateAmPm.removeAttribute('disabled')
		updateInput.removeAttribute('disabled')
		updateInput.focus()

		updateLeftButton.removeAttribute('disabled')
		updateLeftButton.textContent = 'Cancel'
		updateLeftButton.classList.add('btn-danger')
		updateLeftButton.classList.add('text-white')
	}

	// Update time
	else if (updateRightButton.textContent === 'Update') {
		const manualTime = `${updateInput.value} ${updateAmPm.value}`

		// Set config
		window.preload.config('manual-time', manualTime)

		// Set time to start now
		setTime(manualTime)

		// Notify: time updated
		window.preload.notification('Time set', 'Your time has been set')

		// LOG: set custom time
		window.preload.log('Custom check-in')

		// Close form
		closeUpdateBox()
	}
});

// Click - on cancel button
updateLeftButton.addEventListener("click", () => {
	closeUpdateBox()
});


// --------------------------------------------
// Logs Read activity
// --------------------------------------------
function setLogs(logs) {
	// Sort to the descending order by time
	// logs.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))

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
				// cellValue += '<button type="button" class="btn btn-link btn-xs">Set</button>'
			}
			cell.innerHTML = cellValue
			row.appendChild(cell);
		}
		logTableBody.prepend(row);
	}
}

// Logs: Listen for latest logs
window.preload.listenActivity((event, logs) => {
	setLogs([JSON.parse(logs)])

	// in case to send back reply to main process
	// event.sender.send('counter-value', newValue)
})

// Logs: On page refresh read
new Promise((resolve, reject) => {
	try {
		resolve(preload.activity())
	} catch (error) {
		reject(error)
	}
}).then(logs => {
	setLogs(JSON.parse(logs))
}).catch(error => console.warn('Loading logs has some error', error))



// --------------------------------------------
// First time set & Listen time
// --------------------------------------------
new Promise((resolve, reject) => {
	try {
		resolve(preload.getConfig())
	} catch (error) {
		reject(error)
	}
}).then(config => {
	if (config['manual-time']) {
		const today = moment(config.today, 'YYYY-MM-DD HH:mm:ss')
		if (today.isSame(moment(), 'day')) {
			const splitTime = config['manual-time'].split(' ');
			updateInput.value = splitTime[0]
			updateAmPm.value = splitTime[1]
			setTime(config['manual-time'])
		} else {
			const timeNow = moment();
			const beforeTime = moment('07:55 am', 'hh:mm a');
			const afterTime = moment('08:30 am', 'hh:mm a');
			if (timeNow.isBetween(beforeTime, afterTime)) {
				const configSetTime = timeNow.format('hh:mm:ss a')
				updateInput.value = timeNow.format('hh:mm:ss')
				updateAmPm.value = timeNow.format('a')
				window.preload.config('manual-time', configSetTime)
			}
		}
	} else {
		// Other cookies here
	}
}).catch(error => console.warn('Loading logs has some error', error))


// --------------------------------------------
// Open external browser on click
// --------------------------------------------
const githubIcon = document.getElementById("github-icon");
githubIcon.addEventListener("click", () => {
	window.preload.openExternalLink('https://github.com/piyushdolar/timeo/releases')
})


// --------------------------------------------
// Test notification
// --------------------------------------------
const notification = document.getElementById("notification-icon");
notification.addEventListener("click", () => {
	window.preload.notification(capitalFirstLetter(preload.name), `You are on v${preload.version}`)
})