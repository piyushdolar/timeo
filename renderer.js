// Initial loading
console.log(preload.name + ' v' + preload.version)

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

// Show live time clock
// setInterval(() => {
// 	let dateTime = document.getElementById('date-time')
// 	dateTime.textContent = moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
// }, 1000)


// --------------------------------------------
// Countdown timer
// --------------------------------------------
let startTime = moment('08:00:00 am', 'hh:mm:ss a');
let endTime = moment('05:00:00 pm', 'hh:mm:ss a');
let flag = {
	check30: true,
	check15: true,
	check5: true
}
setInterval(function () {
	// Show clock
	let dateTime = document.getElementById('date-time')
	dateTime.textContent = moment().format("dddd, MMMM Do YYYY, h:mm:ss a")

	// console.log(moment().isBetween(startTime, endTime))
	const currentTime = moment()

	// Calculate the time differences
	const timeLeft = moment.duration(endTime.diff(currentTime));

	// Get the difference in hours, minutes, and seconds for both cases
	const hours = Math.floor(timeLeft.asHours());
	const minutes = timeLeft.minutes();
	const seconds = timeLeft.seconds();

	// Display the result in the element with id="demo"
	const text = hours + "h " + minutes + "m " + seconds + "s ";
	document.getElementById("remaining-time").textContent = text

	// --------------- NOTIFICATION ----------------//
	// Notify: Send notification before 30 minutes
	if (flag.check30 && hours === 0 && minutes === 30 && seconds === 0) {
		flag.check30 = false
		window.preload.notification('Reminder', '30 minutes left for checkout')

		// Notify: Send notification before 15 minutes
	} else if (flag.check15 && hours === 0 && minutes === 15 && seconds === 0) {
		flag.check15 = false
		window.preload.notification('Pack up', '15 minutes left for checkout')

		// Notify: Send notification before 5 minutes
	} else if (flag.check5 && hours === 0 && minutes === 5 && seconds === 0) {
		flag.check5 = false
		window.preload.notification('Leaving time', '5 minutes left for checkout')
	}
	// --------------- NOTIFICATION ----------------//


	// If the count down is finished, write some text
	if (timeLeft.asMilliseconds() < 0) {
		// clearInterval(timer);
		document.getElementById("remaining-time").innerHTML = "OVERTIME!";
	}
}, 1000);


// --------------------------------------------
// Update custom time
// --------------------------------------------
const updateLeftButton = document.getElementById("update-left-button")
const updateInput = document.getElementById("update-input")
const updateAmpm = document.getElementById("update-ampm")
let updateRightButton = document.getElementById("update-right-button");

// Update initial time
updateInput.value = moment().format('hh:mm:ss')
updateAmpm.value = moment().format('a')

// Click - on cancel/exit
function closeUpdateBox() {
	updateLeftButton.setAttribute('disabled', true)
	updateLeftButton.textContent = 'Check In'
	updateLeftButton.classList.remove('btn-danger')
	updateLeftButton.classList.remove('text-white')

	updateInput.setAttribute('disabled', true)
	updateAmpm.setAttribute('disabled', true)

	updateRightButton.textContent = 'Edit'
	updateRightButton.classList.remove('btn-primary')
	updateRightButton.classList.remove('text-white')
}
async function setTime(time = moment().format('hh:mm:ss'), ampm = moment().format('a')) {
	const initialTime = moment(time + ' ' + ampm, 'hh:mm:ss a');
	let totalHour = 9
	// Check if saturday
	if (moment().day() === 6) totalHour = 4;
	const timeAfter9Hours = initialTime.clone().add(totalHour, 'hours');
	startTime = initialTime
	endTime = timeAfter9Hours
}
// Click - on update button
updateRightButton.addEventListener("click", () => {
	// Edit input
	if (updateRightButton.textContent === 'Edit') {
		updateRightButton.textContent = 'Update'
		updateRightButton.classList.add('btn-primary')
		updateRightButton.classList.add('text-white')

		updateAmpm.removeAttribute('disabled')
		updateInput.removeAttribute('disabled')
		updateInput.focus()

		updateLeftButton.removeAttribute('disabled')
		updateLeftButton.textContent = 'Cancel'
		updateLeftButton.classList.add('btn-danger')
		updateLeftButton.classList.add('text-white')
	}

	// Update time
	else if (updateRightButton.textContent === 'Update') {
		// set cookie to use it
		const d = new Date();
		d.setTime(d.getTime() + (30 * 1000)); // 24 * 60 * 60 * 1000
		const expiryTime = d.toUTCString()
		document.cookie = "manualTime=" + updateInput.value + "; expires=" + expiryTime + "; path=/;";

		// Set time to start now
		setTime(updateInput.value, updateAmpm.value)

		// Set custom time
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
	let array = []
	array.push(JSON.parse(logs))
	setLogs(array)

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
	setLogs(logs)
}).catch(error => console.warn('Loading logs has some error', error))


// --------------------------------------------
// First time check In
// --------------------------------------------
window.preload.listenFirstTimeCheckIn((event, isValid) => {
	isValid ? setTime(moment().format('hh:mm:ss'), 'am') : ''
})


// --------------------------------------------
// Open new window - report history
// --------------------------------------------
let openReportWindow = document.getElementById("open-report-window");
openReportWindow.addEventListener("click", () => {
	window.preload.openReportWindow()
})
