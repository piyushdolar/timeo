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

// Date time show
setInterval(() => {
	let dateTime = document.getElementById('date-time')
	dateTime.textContent = moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
}, 1000)


// --------------------------------------------
// Countdown
// --------------------------------------------
let startTime = moment('08:00:00 am', 'hh:mm:ss a');
let endTime = moment('05:00:00 pm', 'hh:mm:ss a');

// Update the count down every 1 second
function checkTimer() {
	const timer = setInterval(function () {
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

		// If the count down is finished, write some text
		if (timeLeft.asMilliseconds() < 0) {
			clearInterval(timer);
			document.getElementById("remaining-time").innerHTML = "OVERTIME!";
		}
	}, 1000);
}



// --------------------------------------------
// Update time
// --------------------------------------------
const updateLeftButton = document.getElementById("update-left-button")
const updateInput = document.getElementById("update-input")
const updateAmpm = document.getElementById("update-ampm")
let updateRightButton = document.getElementById("update-right-button");

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
		const initialTime = moment(updateInput.value + ' ' + updateAmpm.value, 'hh:mm:ss a');
		console.log(moment().day())
		let totalHour = 9
		// Check if saturday
		if (moment().day() === 6) totalHour = 4;
		const timeAfter9Hours = initialTime.clone().add(totalHour, 'hours');
		startTime = initialTime
		endTime = timeAfter9Hours
		checkTimer()
		// startTime = updateInput.value + ' ' + updateAmpm.value
		closeUpdateBox()
	}
});

// Click - on cancel button
updateLeftButton.addEventListener("click", () => {
	closeUpdateBox()
});


// --------------------------------------------
// Read activity
// --------------------------------------------
// new Promise((resolve, reject) => {
// 	try {
// 		resolve(preload.activity())
// 	} catch (error) {
// 		reject(error)
// 	}
// }).then(logs => {
// 	const logTableBody = document.getElementById('log-table-body')
// 	// Create a new row element for each row in the table data
// 	for (var i = 0; i < logs.length; i++) {
// 		let row = document.createElement("tr");
// 		// Create a new cell element for each column in the table data

// 		for (let j = 0; j < Object.keys(logs[i]).length; j++) {
// 			let cell = document.createElement("td");
// 			cellValue = logs[i][Object.keys(logs[i])[j]];
// 			if (Object.keys(logs[i])[j] === 'eventTime') {
// 				let checkDate = moment(logs[i][Object.keys(logs[i])[j]])
// 				cellValue = checkDate.isValid() ? moment(logs[i][Object.keys(logs[i])[j]]).format('hh:mm:ss a') : cellValue
// 			}
// 			cell.innerHTML = cellValue
// 			row.appendChild(cell);
// 		}
// 		logTableBody.appendChild(row);
// 	}
// }).catch(error => console.warn('Loading logs has some error', error))